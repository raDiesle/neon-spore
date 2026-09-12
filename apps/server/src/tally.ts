/**
 * What a pair got to, kept by the room they share.
 *
 * Three fields and no more: the furthest wave they reached, and the clock and
 * the retries they reached it on (`sim/wave-fail.ts`). A record nothing
 * reads is dead weight, and this one has a
 * reader from the day it is written — the room screen says one line when the
 * two of them come back. Once a room is named for the pair (`pairing.ts`),
 * that line follows the two people rather than the device.
 *
 * **The room never reads it into game state.** It is stored and handed back,
 * exactly like a `Command` is relayed and never opened: a server that kept
 * the clock would be a second implementation of the rules.
 *
 * **Where the two seats disagree, the further wins.** Neither is authoritative
 * — a seat that dropped early holds the lower tally, and the pair did in fact
 * reach the higher one. At the same wave the *earlier* arrival is kept: fewer
 * retries, then less time, which is the moment the wave was reached rather
 * than the last thing said before the phone went away.
 */

export interface Tally {
  /** The furthest wave reached, counted from 0 as `world.wave` is. */
  wave: number;
  /** The run's clock when they were there, in whole seconds of play. */
  seconds: number;
  /** How many times a wave had been gone again by then. */
  retries: number;
}

export const NOTHING_YET: Tally = { wave: 0, seconds: 0, retries: 0 };

/** A whole, non-negative number, or 0 for anything that is not one. */
function whole(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value) && value >= 0 ? Math.floor(value) : 0;
}

/** A tally off the wire, clamped. Never rejected: a bad one is simply zeroes. */
export function tallyFromWire(value: unknown): Tally {
  const read = (value ?? {}) as Partial<Tally>;
  return { wave: whole(read.wave), seconds: whole(read.seconds), retries: whole(read.retries) };
}

/**
 * The better of two tallies, whole.
 *
 * Whole rather than field by field, because the three fields are one moment:
 * the clock and the retries mean nothing apart from the wave they were read
 * at. The further wave wins; at the same wave, fewer retries, then less time.
 * A seat sends these every few seconds of the same run, so at the same wave
 * that keeps the first one heard there — the arrival — rather than the last.
 */
export function bestOf(held: Tally, arriving: Tally): Tally {
  if (arriving.wave !== held.wave) return arriving.wave > held.wave ? arriving : held;
  if (arriving.retries !== held.retries) return arriving.retries < held.retries ? arriving : held;
  return arriving.seconds < held.seconds ? arriving : held;
}

/** Whether there is anything here worth saying to a returning pair. */
export function worthSaying(tally: Tally): boolean {
  return tally.wave > 0 || tally.seconds > 0 || tally.retries > 0;
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
