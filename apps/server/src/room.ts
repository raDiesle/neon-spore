import {
  type ClientMessage,
  decodeClient,
  isRoomCode,
  type PlayerId,
  PROTOCOL_VERSION,
  type ServerMessage,
  VERSION_PARAM,
} from "@neon-spore/net";
import {
  hangUp,
  lastSeen,
  refuse,
  SEAT_SILENT_MS,
  type Seat,
  seatTag,
  send,
  stamp,
} from "./seat.js";

/**
 * Milliseconds between the second phone arriving and beat zero. Long enough
 * for two people to look up from their screens and say "go", which is the only
 * thing the countdown is for — the clocks have already agreed by then.
 */
const COUNTDOWN_MS = 3000;

interface RoomEnv {
  SEAT_SILENT_MS?: string;
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

  constructor(ctx: DurableObjectState, env: RoomEnv) {
    this.ctx = ctx;
    const given = Number(env?.SEAT_SILENT_MS);
    this.silentMs = Number.isFinite(given) && given > 0 ? given : SEAT_SILENT_MS;
    // Hibernation drops everything held in memory, so the two facts that must
    // outlive it are read back the moment the object is built again.
    ctx.blockConcurrencyWhile(async () => {
      this.code = (await ctx.storage.get<string>("code")) ?? "";
      this.startMs = (await ctx.storage.get<number>("startMs")) ?? 0;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const code = new URL(request.url).searchParams.get("code") ?? "";
    if (!isRoomCode(code)) return new Response("bad room code", { status: 400 });
    if (request.headers.get("Upgrade") !== "websocket") {
      return new Response("expected websocket", { status: 426 });
    }
    if (this.code !== code) {
      this.code = code;
      await this.ctx.storage.put("code", code);
    }

    // Before a seat is handed out, and before beat zero can be stamped for the
    // peer: a build that cannot play this protocol must be turned away with
    // nothing spent on it. The version rides the upgrade for that reason —
    // a first message could only be read after all of it had already happened.
    const version = new URL(request.url).searchParams.get(VERSION_PARAM);
    if (Number(version) !== PROTOCOL_VERSION) {
      return refuse("protocol", `protocol version ${PROTOCOL_VERSION} expected`);
    }

    const seats = this.seats();
    // A third phone is refused *through* the socket rather than in front of it.
    // A 409 never reaches the page as anything but a socket that would not
    // open, which is indistinguishable from a dead line — so the upgrade is
    // completed, the reason is said in the one vocabulary the indicator reads,
    // and only then is the socket closed. It is never given a seat tag, so it
    // is not a seat and `announce` will not count it as one leaving.
    if (seats.length >= 2) return refuse("full", `room ${code} already has two`);

    const pair = new WebSocketPair();
    const client = pair[0];
    const server = pair[1];
    const player: PlayerId = seats.some((s) => s.player === 1) ? 2 : 1;
    // The seat is a tag rather than a field: hibernation wakes the object with
    // nothing but its sockets, and a tag survives that where a Map does not.
    this.ctx.acceptWebSocket(server, [seatTag(player)]);
    stamp(server);
    await this.greet(server, player);
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
      case "input":
        this.relay(me, {
          t: "input",
          player: me.player,
          tick: message.tick,
          commands: message.commands,
        });
        return;
      case "confirm":
        this.relay(me, { t: "confirm", player: me.player, tick: message.tick });
        return;
      case "hash":
        this.relay(me, {
          t: "hash",
          player: me.player,
          tick: message.tick,
          hash: message.hash,
        });
        return;
    }
  }

  /** Tell a new arrival who it is, and stamp beat zero once there are two. */
  private async greet(socket: WebSocket, player: PlayerId): Promise<void> {
    const seats = this.seats();
    const peers = seats.length;
    if (peers >= 2) {
      // Beat zero is stamped when the second phone lands, and both are told the
      // same number. Neither device picks its own: that is the whole reason the
      // room exists rather than a peer-to-peer handshake.
      this.startMs = Date.now() + COUNTDOWN_MS;
      await this.ctx.storage.put("startMs", this.startMs);
    }
    for (const seat of seats) {
      send(seat.socket, {
        t: "welcome",
        player: seat.socket === socket ? player : seat.player,
        room: this.code,
        startMs: this.startMs,
        peers,
      });
    }
  }

  private announce(gone: WebSocket): void {
    const left = this.seats().filter((s) => s.socket !== gone);
    for (const seat of left) send(seat.socket, { t: "peers", peers: left.length });
  }

  private relay(from: Seat, message: ServerMessage): void {
    for (const seat of this.seats()) {
      if (seat.player !== from.player) send(seat.socket, message);
    }
  }

  /**
   * The seats that are actually occupied. A socket that has not spoken in
   * `SEAT_SILENT_MS` is hung up on and left out of the count — a phone whose
   * connection vanished is not holding its seat against its own return.
   */
  private seats(): Seat[] {
    const out: Seat[] = [];
    const now = Date.now();
    for (const socket of this.ctx.getWebSockets()) {
      const player = this.playerOf(socket);
      if (!player) continue;
      if (now - lastSeen(socket) > this.silentMs) {
        hangUp(socket);
        continue;
      }
      out.push({ socket, player });
    }
    return out;
  }

  private seatOf(socket: WebSocket): Seat | null {
    const player = this.playerOf(socket);
    return player ? { socket, player } : null;
  }

  private playerOf(socket: WebSocket): PlayerId | null {
    for (const tag of this.ctx.getTags(socket)) {
      if (tag === seatTag(1)) return 1;
      if (tag === seatTag(2)) return 2;
    }
    return null;
  }
}
