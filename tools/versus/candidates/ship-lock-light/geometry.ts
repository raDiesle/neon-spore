import { arcFromTop } from "../../../../packages/render/src/arc-from-top.js";
import type { LockLightAt } from "../../../../packages/render/src/lock-light-look.js";
import { PALETTE } from "../../../../packages/render/src/palette.js";

/**
 * The ring every subtle answer draws: a thin yellow line just outside the egg
 * in the cannon's mouth (`cannon-maw.ts`). The owner, 19 October 2026: *a
 * small yellow circle around the rounding inside of the cannon*. The answers
 * differ only in what the ring does while the lock rests and when it is ready.
 */

/** How far outside the egg the ring stands, and how thick it is, in tiles. */
const GAP = 0.07;
const WIDTH = 0.05;

export const RIM_INK = PALETTE.pod;

/** The ring's two half axes, in pixels. */
function radii(at: LockLightAt): { rx: number; ry: number } {
  return { rx: at.mouthRx + at.tile * GAP, ry: at.mouthRy + at.tile * GAP };
}

/** The ring's line width, never under a pixel. */
export function rimWidth(at: LockLightAt): number {
  return Math.max(1, at.tile * WIDTH);
}

/** The whole ring as the current path. */
export function rimPath(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  const { rx, ry } = radii(at);
  ctx.beginPath();
  ctx.ellipse(at.x, at.mouthY, rx, ry, 0, 0, Math.PI * 2);
}

/**
 * The ring from twelve o'clock clockwise for `share` of a turn, as the current
 * path. A circle squashed to the egg rather than an ellipse arc of its own, so
 * the start and the sweep are `arcFromTop`'s; the path keeps the squash and the
 * stroke, taken after the restore, does not.
 */
export function rimArc(ctx: CanvasRenderingContext2D, at: LockLightAt, share: number): void {
  const { rx, ry } = radii(at);
  ctx.save();
  ctx.translate(at.x, at.mouthY);
  ctx.scale(1, ry / rx);
  ctx.beginPath();
  arcFromTop(ctx, 0, 0, rx, share);
  ctx.restore();
}
