import type { Difficulty, PlayerId, RunMark } from "@neon-spore/net";
import { tellReady } from "./room-start.js";
import { hostOf, namesOf, type Seat, send } from "./seat.js";
import type { StartGate } from "./start-gate.js";

/**
 * **What the room tells its seats when somebody arrives or leaves.**
 *
 * Two messages and no rules: a `welcome` to everybody when a phone lands, and a
 * `peers` to whoever is left when one goes. Split out of `room.ts` when the
 * difficulty joined the welcome and that file reached its 250-line limit, along
 * the seam it already had — `room.ts` is the Durable Object, its sockets and
 * its routing; this is the two sentences it says about itself, and neither of
 * them reads a message or decides anything.
 *
 * Both take what they need rather than the room: the room's own fields are
 * private and mutable, and a function handed a copy of four of them cannot
 * change the fifth by accident.
 */

/** What a `welcome` is made of, beside the seat it is addressed to. */
export interface RoomFacts {
  code: string;
  /** Beat zero as it stands, 0 for a room with no run in it. */
  startMs: number;
  /** What this pair got to, or null for a room with nothing worth saying. */
  best: RunMark | null;
  /** The tempo the pair plays at, or null before either has chosen. */
  level: Difficulty | null;
}

/**
 * Tell a new arrival who it is, and everybody else that it came.
 *
 * Nothing is stamped by an arrival any more: beat zero waits on two presses,
 * which is the whole of `start-gate.ts`. The seat this socket holds is passed
 * in rather than looked up, because it has just been handed out and the room
 * is the only thing that knows it yet.
 */
export function greetSeats(
  seats: Seat[],
  socket: WebSocket,
  player: PlayerId,
  facts: RoomFacts,
  gate: StartGate,
): void {
  tellSeats(
    seats.map((seat) => (seat.socket === socket ? { ...seat, player } : seat)),
    facts,
    gate,
  );
}

/**
 * Say the welcome again, to everybody, because what it would say has changed:
 * the tempo the host picked, the seats swapped. Both phones read their seat
 * and the pair's answers off one message rather than off a history of edges —
 * the same reason a `ready` carries the whole set (`protocol.ts`).
 */
export function tellSeats(seats: Seat[], facts: RoomFacts, gate: StartGate): void {
  const peers = seats.length;
  for (const seat of seats) {
    send(seat.socket, {
      t: "welcome",
      player: seat.player,
      room: facts.code,
      startMs: facts.startMs,
      peers,
      names: namesOf(seats),
      best: facts.best,
      level: facts.level,
      host: hostOf(seats),
    });
  }
  if (peers >= 2) tellReady(gate, seats);
}

/**
 * Tell whoever is left that a seat has gone, and take its press with it.
 *
 * The one still here must not be one thumb away from starting a game with
 * nobody in the other chair, which is why the gate is dropped before anything
 * is sent. Whether the run itself is over is the room's own decision and stays
 * there (`emptiedRoom`).
 */
export function announceGone(left: Seat[], gone: PlayerId | null, gate: StartGate): void {
  if (gone) gate.drop(gone);
  for (const seat of left) {
    send(seat.socket, { t: "peers", peers: left.length, names: namesOf(left) });
  }
  if (left.length > 0) tellReady(gate, left);
}
