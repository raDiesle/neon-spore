import { drawInstarRing } from "./instar-ring.js";
import { type LampreyPose, lampreyToothAt } from "./lamprey-shape.js";

/**
 * **THE LAMPREY's tooth mark**: the ring round the one lit tooth in a
 * `teeth`, drawn the way every boss's tap mark is — THE INSTAR's ring with
 * its tap glyph inside (`instar-ring.ts`), red, breathing on the worker's
 * screen and dim with the waiting clock on the holder's (the owner, 6
 * October 2026: *the tap visualisation should be the same as on other
 * bosses*). **A tooth is a run of taps**, so the ring's green arc fills a
 * share for each tap it has taken toward its step's `taps`, and empties when
 * a wrong one snaps it back. The time left is THE SLOW's own clock, not the
 * mark's; the tail and the head are knobs (`lamprey-handles.ts`).
 */

/** The tooth's ring, in mouth radii: the circle the halo and the verdict stand on. */
export const LAMPREY_TOOTH_RING = 0.32;

/** What the ring shows: a tap. */
const TAP = { gesture: "tap", color: "red" } as const;

/** The ring round the lit tooth: `full` on the worker's screen; `along` the share of its taps taken. */
export function drawLampreyToothMark(
  ctx: CanvasRenderingContext2D,
  p: LampreyPose,
  tooth: number,
  full: boolean,
  along: number,
  time: number,
): void {
  const at = lampreyToothAt(p, tooth);
  const r = p.r * LAMPREY_TOOTH_RING;
  drawInstarRing(ctx, at.x, at.y, r, TAP, full, false, along, time, false);
}
