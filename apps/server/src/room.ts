import {
  type ClientMessage,
  type Difficulty,
  decodeClient,
  NAME_PARAM,
  nameFromWire,
  type PlayerId,
  type ServerMessage,
} from "@neon-spore/net";
import { refuseUpgrade } from "./room-open.js";
import { pressStart } from "./room-start.js";
import { endStaleRun, keepBest, keepLevel, readBest, readLevel } from "./room-tally.js";
import { announceGone, greetSeats, type RoomFacts } from "./room-tell.js";
import {
  hangUp,
  nameTag,
  occupiedSeats,
  playerOfSocket,
  SEAT_SILENT_MS,
  type Seat,
  seatOfSocket,
  seatTag,
  send,
  stamp,
} from "./seat.js";
import { emptiedRoom, StartGate } from "./start-gate.js";
import { NOTHING_YET, RUN_OVER_MS, type Tally, tallyFromWire, worthSaying } from "./tally.js";

/**
 * Milliseconds between the **second press** and beat zero — only the short
 * lead the two clocks need to land it together. The wait for the two people
 * is the press itself; see `start-gate.ts` for why it is not a timer.
 */
const START_LEAD_MS = 800;

interface RoomEnv {
  SEAT_SILENT_MS?: string;
  /** How long a room holds a run open with nobody in it. See `tally.ts`. */
  RUN_OVER_MS?: string;
}

/**
 * One room, one Durable Object. It relays inputs, hands out the beat zero
 * point and answers clock syncs. Nothing else — see `docs/architecture.md`,
 * "Network", and `packages/net/src/protocol.ts`.
 *
 * It never looks inside a `Command` and holds no copy of the world. A server
 * that understood the game would be a second implementation of the rules, and
 * the reason for lockstep is that there is exactly one.
 */
export class Room {
  private readonly ctx: DurableObjectState;
  private readonly silentMs: number;
  private code = "";
  private startMs = 0;
  /** The two presses between a full room and beat zero. See `start-gate.ts`. */
  private readonly gate = new StartGate();
  private readonly runOverMs: number;
  /** What this pair got to. Stored, handed back, never read. See `tally.ts`. */
  private best: Tally = NOTHING_YET;
  /** When this room last heard anything at all, for `runIsOver`. */
  private heard = 0;
  /** The tempo this pair plays at, kept the way `best` is and never read: two
   * phones at two tempi never reach the same tick, so the pair's one answer
   * lives here (`packages/sim/src/difficulty.ts`, `room-tally.ts`). */
  private level: Difficulty | null = null;

  constructor(ctx: DurableObjectState, env: RoomEnv) {
    this.ctx = ctx;
    const given = Number(env?.SEAT_SILENT_MS);
    this.silentMs = Number.isFinite(given) && given > 0 ? given : SEAT_SILENT_MS;
    const over = Number(env?.RUN_OVER_MS);
    this.runOverMs = Number.isFinite(over) && over > 0 ? over : RUN_OVER_MS;
    // Hibernation drops everything held in memory, so the two facts that must
    // outlive it are read back the moment the object is built again.
    ctx.blockConcurrencyWhile(async () => {
      this.code = (await ctx.storage.get<string>("code")) ?? "";
      this.startMs = (await ctx.storage.get<number>("startMs")) ?? 0;
      this.best = await readBest(ctx.storage);
      this.level = await readLevel(ctx.storage);
      this.heard = (await ctx.storage.get<number>("heard")) ?? 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const code = new URL(request.url).searchParams.get("code") ?? "";
    // A run nobody has been playing is over before this phone is seated (see
    // `runIsOver`), so the arrival gets a fresh beat zero.
    const ended = await endStaleRun(
      this.ctx.storage,
      Date.now() - this.heard,
      this.runOverMs,
      this.seats().length,
      this.startMs,
    );
    if (ended) {
      this.startMs = 0;
      this.gate.clear();
    }

    const seats = this.seats();
    const refused = refuseUpgrade(request, code, seats.length);
    if (refused) return refused;
    if (this.code !== code) {
      this.code = code;
      await this.ctx.storage.put("code", code);
    }

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const player: PlayerId = seats.some((s) => s.player === 1) ? 2 : 1;
    // The seat is a tag rather than a field: hibernation wakes the object with
    // nothing but its sockets, and a tag survives that where a Map does not.
    // The name rides the upgrade beside the version, clamped on the way in by
    // the same rule both clients apply on the way out. It is a tag because the
    // seat is: hibernation wakes this object holding nothing but sockets.
    const name = nameFromWire(new URL(request.url).searchParams.get(NAME_PARAM));
    this.ctx.acceptWebSocket(server, [seatTag(player), nameTag(name)]);
    stamp(server);
    this.greet(server, player);
    return new Response(null, { status: 101, webSocket: client });
  }

  webSocketMessage(socket: WebSocket, raw: string | ArrayBuffer): void {
    if (typeof raw !== "string") return;
    const message = decodeClient(raw);
    const me = this.seatOf(socket);
    if (!message || !me) return;
    // Anything at all is proof the seat is still there. The ping every 700 ms
    // is what makes that a heartbeat rather than a hope.
    stamp(socket);
    // The room's own clock for `runIsOver`: a socket's `lastSeen` goes with it
    // when it is evicted, and what is measured is the silence after the last.
    this.heard = Date.now();
    void this.ctx.storage.put("heard", this.heard);
    this.route(me, message, socket);
  }

  // The socket is closed from this side too, and not merely mourned: a half of
  // a connection this object still holds open is a seat nobody is sitting in
  // and nobody else may have.
  webSocketClose(socket: WebSocket): void {
    hangUp(socket);
    this.announce(socket);
  }

  webSocketError(socket: WebSocket): void {
    hangUp(socket);
    this.announce(socket);
  }

  private route(me: Seat, message: ClientMessage, socket: WebSocket): void {
    switch (message.t) {
      case "ping": {
        // Two server timestamps, so the client can take this object's own
        // handling time back out of the round trip.
        const s1 = Date.now();
        send(socket, { t: "pong", c1: message.c1, s1, s2: Date.now() });
        return;
      }
      // The three that are simply passed on, with the seat the socket holds
      // stamped on. Spread rather than rebuilt field by field: the room never
      // looks inside a `Command` and has no business naming the fields of one.
      case "input":
      case "confirm":
      case "hash":
        this.relay(me, { ...message, player: me.player });
        return;
      case "ready":
        void this.press(me.player);
        return;
      case "level":
        // Stored and handed back, the way `stats` is; one that is not a level
        // never arrives at all (`protocol-decode.ts`).
        this.level = message.level;
        void keepLevel(this.ctx.storage, message.level);
        return;
      case "stats":
        // Stored and never opened, the way a `Command` is relayed and never
        // opened. The further seat's whole, because the clock and the retries
        // are read at the wave (`tally.ts`).
        void keepBest(this.ctx.storage, this.best, tallyFromWire(message)).then((next) => {
          this.best = next;
        });
        return;
    }
  }

  /** A seat pressed START. `start-gate.ts` decides what that is worth. */
  private async press(player: PlayerId): Promise<void> {
    const startMs = await pressStart(
      this.gate,
      player,
      {
        ...this.facts(),
        seats: this.seats(),
        persist: (at) => this.ctx.storage.put("startMs", at),
      },
      START_LEAD_MS,
    );
    if (startMs !== 0) this.startMs = startMs;
  }

  /** Who it is, to the arrival and to whoever was already here (`room-tell.ts`). */
  private greet(socket: WebSocket, player: PlayerId): void {
    greetSeats(this.seats(), socket, player, this.facts(), this.gate);
  }

  /** A seat has gone: the others are told, and its press goes with it. The run
   * ending with it is this object's own decision (`start-gate.ts`). */
  private announce(gone: WebSocket): void {
    const left = this.seats().filter((s) => s.socket !== gone);
    if (emptiedRoom(left.length, this.startMs)) {
      this.startMs = 0;
      void this.ctx.storage.put("startMs", 0);
    }
    announceGone(left, this.playerOf(gone), this.gate);
  }

  /** The four things a welcome is made of, gathered where they are kept. */
  private facts(): RoomFacts {
    return {
      code: this.code,
      startMs: this.startMs,
      best: worthSaying(this.best) ? this.best : null,
      level: this.level,
    };
  }

  private relay(from: Seat, message: ServerMessage): void {
    for (const seat of this.seats()) {
      if (seat.player !== from.player) send(seat.socket, message);
    }
  }

  /** The seats that are actually occupied — see `occupiedSeats`. */
  private seats(): Seat[] {
    return occupiedSeats(this.ctx, this.silentMs);
  }

  private seatOf(socket: WebSocket): Seat | null {
    return seatOfSocket(this.ctx, socket);
  }

  private playerOf(socket: WebSocket): PlayerId | null {
    return playerOfSocket(this.ctx, socket);
  }
}
