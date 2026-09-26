import type { PlumbAsk } from "./plumb.js";

/**
 * What THE PLUMB says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The bob hangs over the middle, so every one is there; the ones
 * about a weight say which with `side`, the pilot's nought and the
 * navigator's one.
 */

interface PlumbColEvent {
  /** The column it happened over. */
  col: number;
}

export type PlumbEvent =
  /** The bob swings in skewed, both weights loose, the core dark. */
  | ({ type: "plumbEnter" } & PlumbColEvent)
  /** A step lit: a weight's level, a shot at the core, or both levels to hold it. */
  | ({ type: "plumbLight"; ask: PlumbAsk } & PlumbColEvent)
  /** A lean drifted out of range in a lit level step: the count starts over. */
  | ({ type: "plumbDrift"; side: 0 | 1 } & PlumbColEvent)
  /** A weight settled true; `level` is how many times it has now. */
  | ({ type: "plumbSettle"; side: 0 | 1; level: number } & PlumbColEvent)
  /** A one-weight level step ran out: the weight swings loose, to be tried again. */
  | ({ type: "plumbSwing"; side: 0 | 1 } & PlumbColEvent)
  /** Both weights locked plumb and the core lights. */
  | ({ type: "plumbCore" } & PlumbColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "plumbHit"; hits: number } & PlumbColEvent)
  /** Both weights held true under the core. */
  | ({ type: "plumbSteady" } & PlumbColEvent)
  /** A `both` step ran out: the core dims, to be held true again. */
  | ({ type: "plumbDim" } & PlumbColEvent)
  /** A fire step ran out with the core unshot: the hull takes it. */
  | ({ type: "plumbMiss" } & PlumbColEvent)
  /** The script is done and both weights snap loose at once. */
  | ({ type: "plumbFree" } & PlumbColEvent)
  /** The spent bob has swung free `plumbFreeBeats`; the wave may end. */
  | ({ type: "plumbOut" } & PlumbColEvent);
