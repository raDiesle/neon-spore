import type { GallAsk } from "./gall.js";

/**
 * What THE GALL says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the alien's point for what happens to the alien, the middle for
 * the fight as a whole. A point is `point`, nought at the left end.
 */

interface GallColEvent {
  /** The column it happened over. */
  col: number;
}

/**
 * Why a hand on the alien did nothing — never silently (the owner's rule for
 * THE TRAPEZE, 7 October 2026): not this seat's half (`seat`), nothing on
 * the point pressed (`empty`), a pull before it is charged (`early`), or a
 * hand dragged too far for a tap and not up enough for a pull (`way`).
 */
export type GallWhy = "seat" | "empty" | "early" | "way";

export type GallEvent =
  /** The alien drops in on its first point. */
  | ({ type: "gallEnter"; point: number } & GallColEvent)
  /** A step lit: the alien to be tapped and thrown, or shot where it sits. */
  | ({ type: "gallLight"; ask: GallAsk; point: number } & GallColEvent)
  /** A tap charged it: `taps` of the `need` the step wants. */
  | ({ type: "gallTap"; point: number; taps: number; need: number } & GallColEvent)
  /** A hand on it did nothing, and `why`. */
  | ({ type: "gallWhiff"; point: number; why: GallWhy } & GallColEvent)
  /** A pull threw it `from` one point `to` another; `leaps` so far. */
  | ({ type: "gallLeap"; from: number; to: number; leaps: number } & GallColEvent)
  /** It came down on `point`, and the clock starts again. */
  | ({ type: "gallLand"; point: number } & GallColEvent)
  /** A shot in its colour took a limb; `hits` is how many it has taken. */
  | ({ type: "gallHit"; hits: number } & GallColEvent)
  /** A step ran out unanswered: the hull takes it. */
  | ({ type: "gallMiss" } & GallColEvent)
  /** The script is done and it drops dead. */
  | ({ type: "gallFlat" } & GallColEvent)
  /** It has lain `gallFlatBeats`; the wave may end. */
  | ({ type: "gallOut" } & GallColEvent);
