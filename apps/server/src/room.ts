import {
  type ClientMessage,
  decodeClient,
  type PlayerId,
  type ServerMessage,
} from "@neon-spore/net";
import { roomActs } from "./room-acts.js";
import { RoomMemory } from "./room-memory.js";
import { refuseUpgrade } from "./room-open.js";
import { routeClient } from "./room-route.js";
import { pressStart } from "./room-start.js";
import { announceGone, greetSeats, type RoomFacts } from "./room-tell.js";
import {
  arrivalTags,
  hangUp,
  occupiedSeats,
  playerOfSocket,
  SEAT_SILENT_MS,
  type Seat,
  seatOfSocket,
  send,
  stamp,
} from "./seat.js";
import { emptiedRoom, StartGate } from "./start-gate.js";
import { RUN_OVER_MS, worthSaying } from "./tally.js";

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
 *
 * What it *is* is sockets: who is in the room, which seat each holds, what
 * reaches whom. What it knows between two of them is `room-memory.ts`, and
 * the three things a message does to that memory are `room-acts.ts`.
 */
export class Room {
  private readonly ctx: DurableObjectState;
  private readonly silentMs: number;
  private readonly runOverMs: number;
  /** The two presses between a full room and beat zero. See `start-gate.ts`. */
  private readonly gate = new StartGate();
  /** Everything that outlives hibernation, with its writes. `room-memory.ts`. */
  private readonly mem: RoomMemory;

  constructor(ctx: DurableObjectState, env: RoomEnv) {
    this.ctx = ctx;
    const given = Number(env?.SEAT_SILENT_MS);
    this.silentMs = Number.isFinite(given) && given > 0 ? given : SEAT_SILENT_MS;
    const over = Number(env?.RUN_OVER_MS);
    this.runOverMs = Number.isFinite(over) && over > 0 ? over : RUN_OVER_MS;
    this.mem = new RoomMemory(ctx.storage);
    // Hibernation drops everything held in memory, so what must outlive it is
    // read back the moment the object is built again.
    ctx.blockConcurrencyWhile(() => this.mem.load());
  }

  async fetch(request: Request): Promise<Response> {
    const code = new URL(request.url).searchParams.get("code") ?? "";
    // A run nobody has been playing is over before this phone is seated (see
    // `runIsOver`), so the arrival gets a fresh beat zero.
    if (await this.mem.endStale(this.runOverMs, this.seats().length)) this.gate.clear();

    const seats = this.seats();
    const refused = refuseUpgrade(request, code, seats.length);
    if (refused) return refused;
    await this.mem.setCode(code);

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    // An empty room starts over: a swap is the pair's, and this is a new pair.
    if (seats.length === 0 && this.mem.swapped) await this.mem.setSwapped(false);
    // Everything about the arrival is a tag: hibernation wakes this object
    // holding nothing but sockets (`seat.ts`).
    const { player, tags } = arrivalTags(seats, this.mem.swapped, request.url);
    this.ctx.acceptWebSocket(server, tags);
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
    void this.mem.heardNow();
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

  /**
   * What each message makes the room do — the switch is `room-route.ts`. The
   * acts that are about sockets are the room's own; the three that are about
   * what it remembers are `room-acts.ts`.
   */
  private route(me: Seat, message: ClientMessage, socket: WebSocket): void {
    routeClient(me, message, socket, {
      relay: (m) => this.relay(me, m),
      press: () => void this.press(me.player),
      sweep: () => this.sweep(),
      ...roomActs(me, this.mem, {
        gate: this.gate,
        seats: () => this.seats(),
        facts: () => this.facts(),
      }),
    });
  }

  /**
   * Ask who is still here. The asking is the whole of it: taking the count
   * hangs up a socket that has gone silent past the window (`occupiedSeats`),
   * that hang-up comes back as `webSocketClose`, and that is what tells
   * whoever is left. Nothing is announced from here.
   *
   * The room used to take a count only when something else made it — a relayed
   * message, a press, an arrival — which is every frame of a run and nothing
   * at all on the room screen, where a ping is the only thing either phone
   * sends. So the ping takes one (`room-route.ts`).
   */
  private sweep(): void {
    void this.seats();
  }

  /** A seat pressed START. `start-gate.ts` decides what that is worth. */
  private async press(player: PlayerId): Promise<void> {
    await pressStart(
      this.gate,
      player,
      {
        ...this.facts(),
        seats: this.seats(),
        persist: (at) => this.mem.setStartMs(at),
      },
      START_LEAD_MS,
    );
  }

  /** Who it is, to the arrival and to whoever was already here (`room-tell.ts`). */
  private greet(socket: WebSocket, player: PlayerId): void {
    greetSeats(this.seats(), socket, player, this.facts(), this.gate);
  }

  /** A seat has gone: the others are told, and its press goes with it. The run
   * ending with it is this object's own decision (`start-gate.ts`). */
  private announce(gone: WebSocket): void {
    const left = this.seats().filter((s) => s.socket !== gone);
    if (emptiedRoom(left.length, this.mem.startMs)) void this.mem.setStartMs(0);
    announceGone(left, this.playerOf(gone), this.gate);
  }

  /** The four things a welcome is made of, gathered where they are kept. */
  private facts(): RoomFacts {
    const best = this.mem.best;
    return {
      code: this.mem.code,
      startMs: this.mem.startMs,
      best: worthSaying(best) ? best : null,
      level: this.mem.level,
    };
  }

  private relay(from: Seat, message: ServerMessage): void {
    for (const seat of this.seats()) {
      if (seat.player !== from.player) send(seat.socket, message);
    }
  }

  /** The seats that are actually occupied — see `occupiedSeats`. */
  private seats(): Seat[] {
    return occupiedSeats(this.ctx, this.silentMs, this.mem.swapped);
  }

  private seatOf(socket: WebSocket): Seat | null {
    return seatOfSocket(this.ctx, socket, this.mem.swapped);
  }

  private playerOf(socket: WebSocket): PlayerId | null {
    return playerOfSocket(this.ctx, socket, this.mem.swapped);
  }
}
