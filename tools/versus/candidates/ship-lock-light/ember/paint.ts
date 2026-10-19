import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { RIM_INK, rimPath, rimWidth } from "../geometry.js";

/**
 * The quietest answer: a thin yellow ring round the egg when the lock is
 * ready, and nothing at all while it rests. The ring coming on is the news.
 */
export function paintEmber(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  if (at.charge < 1) return;
  ctx.save();
  ctx.lineWidth = rimWidth(at);
  ctx.strokeStyle = RIM_INK;
  rimPath(ctx, at);
  ctx.stroke();
  ctx.restore();
}
