/**
 * What a pair got to, kept by the room they share.
 *
 * Two fields and no more: the furthest wave they reached and the score they
 * were last on. A record nothing reads is dead weight, and this one has a
 * reader from the day it is written — the room screen says one line when the
 * two of them come back. Once a room is named for the pair (`pairing.ts`),
 * that line follows the two people rather than the device.
 *
 * **The room never reads it into game state.** It is stored and handed back,
 * exactly like a `Command` is relayed and never opened: a server that kept
 * score would be a second implementation of the rules.
 *
 * **Where the two seats disagree, the higher wins.** Neither is authoritative
 * — a seat that dropped early holds the lower tally, and the pair did in fact
 * reach the higher one.
 */

export interface Tally {
  /** The furthest wave reached, counted from 0 as `world.wave` is. */
  wave: number;
  /** The score they were on. */
  score: number;
}

export const NOTHING_YET: Tally = { wave: 0, score: 0 };

/** A whole, non-negative number, or 0 for anything that is not one. */
function whole(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

/** A tally off the wire, clamped. Never rejected: a bad one is simply zeroes. */
export function tallyFromWire(value: unknown): Tally {
  const read = (value ?? {}) as Partial<Tally>;
  return { wave: whole(read.wave), score: whole(read.score) };
}

/**
 * The better of two tallies, field by field.
 *
 * Field by field rather than whole: one seat may have seen the furthest wave
 * and the other the higher score — a run where the hull broke on wave nine
 * after a good wave eight is exactly that shape — and taking the "better
 * record" whole would throw one of the two facts away.
 */
export function bestOf(held: Tally, arriving: Tally): Tally {
  return {
    wave: Math.max(held.wave, arriving.wave),
    score: Math.max(held.score, arriving.score),
  };
}

/** Whether there is anything here worth saying to a returning pair. */
export function worthSaying(tally: Tally): boolean {
  return tally.wave > 0 || tally.score > 0;
}

/**
 * Whether a run should be given up on, having heard nothing for long enough.
 *
 * A seat silent past `SEAT_SILENT_MS` is evicted and its partner told, which
 * handles one phone going away. What it does not handle is *both* of them: the
 * room is left holding a beat zero, no sockets, and a run nobody is playing —
 * and the next phone to arrive is handed that stamp and starts from tick 0
 * against a game that ended half an hour ago.
 *
 * So a room that has been empty and quiet this long has no run in it, and the
 * next arrival gets a fresh beat zero. The window is longer than the eviction
 * one on purpose: this ends a *run*, and ending one because a lift went
 * through a tunnel would be worse than waiting.
 *
 * The trade-off, said out loud: this window is also how long a dead pair keeps
 * a third phone out of their room, because a room with a stamp in it is a room
 * that is busy. Thirty seconds is the owner's figure for both halves of that.
 */
export function runIsOver(
  quietMs: number,
  windowMs: number,
  seatCount: number,
  startMs: number,
): boolean {
  return startMs !== 0 && seatCount === 0 && quietMs > windowMs;
}

/** How long a room holds a run open with nobody in it. The owner's figure. */
export const RUN_OVER_MS = 30_000;
