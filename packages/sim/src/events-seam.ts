import type { SeamAsk } from "./seam.js";

/**
 * What THE SEAM says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The ridge stands in the middle, so all but a rock's are there.
 */

interface SeamColEvent {
  /** The column it happened over. */
  col: number;
}

export type SeamEvent =
  /** The ridge settles into frame, the crack dark. */
  | ({ type: "seamEnter" } & SeamColEvent)
  /** A step lit: a point, grit, a rock, or grit and a rock at once. */
  | ({ type: "seamLight"; ask: SeamAsk } & SeamColEvent)
  /** A point shot in its colour that does not seal: it dims. */
  | ({ type: "seamDim" } & SeamColEvent)
  /** A point shot shut; `sealed` is how many are shut now. */
  | ({ type: "seamSeal"; sealed: number } & SeamColEvent)
  /** A shot landed on the glow; `left` is how many more it wants, 0 once quenched. */
  | ({ type: "seamQuench"; left: number } & SeamColEvent)
  /** A spat rock shot out. */
  | ({ type: "seamRockOut" } & SeamColEvent)
  /** Grit taken on the shield. */
  | ({ type: "seamBlock" } & SeamColEvent)
  /** A step ran out unanswered: the hull takes it. */
  | ({ type: "seamMiss" } & SeamColEvent)
  /** The script is done and the sealed ridge splits down its crack. */
  | ({ type: "seamSplit" } & SeamColEvent)
  /** The split ridge has hung `seamSplitBeats`; the wave may end. */
  | ({ type: "seamOut" } & SeamColEvent);
