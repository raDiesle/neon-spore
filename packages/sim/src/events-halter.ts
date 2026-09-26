import type { HalterAsk } from "./halter.js";

/**
 * What THE HALTER says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The seam hangs over the middle, so every one is there; the ones
 * about a seat say which with `seat`, and the ones about a segment say which
 * with `side`, the left nought and the right one.
 */

interface HalterColEvent {
  /** The column it happened over. */
  col: number;
}

export type HalterEvent =
  /** The seam settles into frame, shut and trembling. */
  | ({ type: "halterEnter" } & HalterColEvent)
  /** A step lit: a segment's mark, the plating creeping back, or the centre to shoot. */
  | ({ type: "halterLight"; ask: HalterAsk } & HalterColEvent)
  /** A resting seat's count reached the threshold with nothing held: its half is true. */
  | ({ type: "halterSettle"; seat: 1 | 2 } & HalterColEvent)
  /** A settled seat sent a command: its rest is gone, and a held pair with it. */
  | ({ type: "halterStartle"; seat: 1 | 2 } & HalterColEvent)
  /** The chording seat lifted a grip while the pair held: both counts start over. */
  | ({ type: "halterSlip"; seat: 1 | 2 } & HalterColEvent)
  /** A segment cracked. */
  | ({ type: "halterCrack"; side: 0 | 1 } & HalterColEvent)
  /** Both segments cracked and the centre lies bare. */
  | ({ type: "halterBare" } & HalterColEvent)
  /** A guard made: the plating held off the centre, which lies bare. */
  | ({ type: "halterGuard" } & HalterColEvent)
  /** A rest-and-chord window ran out unmade: the step is tried again. */
  | ({ type: "halterShut" } & HalterColEvent)
  /** A guard failed: the plating closes over the centre, to be held off again. */
  | ({ type: "halterSeal" } & HalterColEvent)
  /** The centre shot in its colour; `hits` is how many it has taken. */
  | ({ type: "halterHit"; hits: number } & HalterColEvent)
  /** A fire step ran out with the centre unshot: the hull takes it. */
  | ({ type: "halterMiss" } & HalterColEvent)
  /** The script is done and the seam splits wide. */
  | ({ type: "halterSplit" } & HalterColEvent)
  /** The spent seam has hung open `halterSpentBeats`; the wave may end. */
  | ({ type: "halterOut" } & HalterColEvent);
