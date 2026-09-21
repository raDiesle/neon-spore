import type { ClientMessage, Difficulty, PlayerId, ServerMessage } from "@neon-spore/net";
import { type Seat, send } from "./seat.js";
import { type Tally, tallyFromWire } from "./tally.js";

/**
 * **What the room does with each message a seat sends** — the one switch
 * over `ClientMessage["t"]`, which gains a case with every message the
 * client learns to send. Cut out of `room.ts` when the file reached its
 * limit, along the seam its siblings already use (`room-open.ts`,
 * `room-tell.ts`, `room-start.ts`): the Durable Object keeps its sockets and
 * its fields, and hands over the things a message can make it do.
 *
 * Closures rather than the room, for `room-tell.ts`'s reason: the room's
 * fields are private and mutable, and a function given a handful of verbs
 * cannot change a field by accident.
 */
export interface RoomActs {
  /** Pass a stamped message to every other seat. */
  relay(message: ServerMessage): void;
  /** This seat pressed START (`start-gate.ts`). */
  press(): void;
  /** Ask who is still in the room; one that has gone quiet is hung up on. */
  sweep(): void;
  /** The pair chose a tempo; kept and handed back (`room-tally.ts`). */
  level(level: Difficulty): void;
  /** The pair got somewhere; kept if it is better (`room-tally.ts`). */
  stats(tally: Tally): void;
  /** The host asks to hold this seat (`room-seat.ts`). */
  seat(seat: PlayerId): void;
}

export function routeClient(
  me: Seat,
  message: ClientMessage,
  socket: WebSocket,
  acts: RoomActs,
): void {
  switch (message.t) {
    case "ping": {
      // **The ping is the only thing the room screen sends, so it is the one
      // that has to ask who is still there.** Nothing is relayed from that
      // screen — no input, no confirm, no hash — and every other case here is
      // something a thumb did. Without this, a phone that vanished while the
      // pair were looking at each other's circles was noticed by nobody, and
      // the one still there went on being shown a partner who was gone
      // (`room.ts` `sweep`). Asked before the stamps, so what it costs is
      // inside the handling time the client takes back out.
      acts.sweep();
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
      acts.relay({ ...message, player: me.player });
      return;
    case "ready":
      acts.press();
      return;
    case "level":
      // Stored and handed back, the way `stats` is; one that is not a level
      // never arrives at all (`protocol-decode.ts`).
      acts.level(message.level);
      return;
    case "stats":
      // Stored and never opened, the way a `Command` is relayed and never
      // opened. The further seat's whole, because the clock and the retries
      // are read at the wave (`tally.ts`).
      acts.stats(tallyFromWire(message));
      return;
    case "seat":
      // Whether it is the host's to ask, and before beat zero, is the room's
      // rule (`room-seat.ts`); the socket says who is asking.
      acts.seat(message.seat);
      return;
  }
}
