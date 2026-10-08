import type { LatchAsk, LatchGrip } from "./latch.js";

/**
 * What THE LATCH says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the tendril hangs down the middle, so a grip's column is one either
 * side of it. A seat is `seat`, nought the pilot; a grip is `grip`, nought the
 * left.
 */

interface LatchColEvent {
  /** The column it happened over. */
  col: number;
}

/** Why a slip: both hands let go at once, or a yank found a hand off. */
export type LatchSlipWhy = "both" | "yank";

export type LatchEvent =
  /** The slime drops in over the field and hooks its tendril into the hull. */
  | ({ type: "latchEnter" } & LatchColEvent)
  /** A level lit: what it asks. */
  | ({ type: "latchLevel"; ask: LatchAsk } & LatchColEvent)
  /** A thumb took hold of its grip. */
  | ({ type: "latchGrip"; seat: 0 | 1; grip: LatchGrip } & LatchColEvent)
  /** A pull let go: the other grip pulls next. */
  | ({ type: "latchTurn"; grip: LatchGrip } & LatchColEvent)
  /** A thumb went down on the partner's grip, and nothing took hold. */
  | ({ type: "latchWrong"; seat: 0 | 1; grip: LatchGrip } & LatchColEvent)
  /** The tendril slipped back to the last knot; `lostMilli` how far. */
  | ({ type: "latchSlip"; why: LatchSlipWhy; lostMilli: number } & LatchColEvent)
  /** The slime rears back: a yank is coming. */
  | ({ type: "latchRear" } & LatchColEvent)
  /** The slime yanked, and both hands were holding. */
  | ({ type: "latchBraced" } & LatchColEvent)
  /** A knot pulled in, and a lobe of the slime torn off; `knots` in so far. */
  | ({ type: "latchKnot"; knots: number } & LatchColEvent)
  /** A level ran out: the slime tears the hull. */
  | ({ type: "latchMiss" } & LatchColEvent)
  /** The last knot: the slime is torn loose. */
  | ({ type: "latchSpent" } & LatchColEvent)
  /** The slime is gone; the wave may end. */
  | ({ type: "latchOut" } & LatchColEvent);
