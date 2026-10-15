import { type LampreyPose, lampreyToothAt } from "./lamprey-shape.js";
import { drawMarkWait } from "./mark-feedback.js";
import { drawPressDrop } from "./press-drop.js";

/**
 * **THE LAMPREY's tooth mark**: on the one lit tooth in a `teeth`, drawn the
 * way every tap on the field is — THE PRESS LAB's drop (`press-drop.ts`),
 * calling on the worker's screen and dim with the waiting clock on the
 * holder's (the owner, 6
 * October 2026: *the tap visualisation should be the same as on other
 * bosses*; and 15 October: *they should follow our standard tap control
 * visuals*). It was THE INSTAR's red ring with a tap glyph until then.
 * **A tooth is a run of taps**, so the drop has a terrace for each of its
 * step's `taps` and fills one for each it has taken, and empties when a
 * wrong one snaps it back. The time left is THE SLOW's own clock, not the
 * mark's; the tail and the head are knobs (`lamprey-handles.ts`).
 */

/** The tooth's mark, in mouth radii: the circle the halo and the verdict stand on. */
export const LAMPREY_TOOTH_RING = 0.32;

/** The drop on the lit tooth: `full` on the worker's screen; `taps` taken of those asked. */
export function drawLampreyToothMark(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  tooth: number,
  full: boolean,
  taps: { done: number; times: number },
  time: number,
): void {
  const at = lampreyToothAt(p, tooth);
  const r = p.r * LAMPREY_TOOTH_RING;
  drawPressDrop(ctx, at, r, { time, times: taps.times, done: taps.done, theirs: !full });
  if (!full) drawMarkWait(ctx, at.x, at.y, r, time);
}
