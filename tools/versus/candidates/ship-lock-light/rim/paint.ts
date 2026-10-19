import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { RIM_INK, rimArc, rimPath, rimWidth } from "../geometry.js";

/**
 * A thin yellow ring round the egg when the lock is ready. While it rests, a
 * faint track with the yellow drawing round it from the top as the rest runs.
 */
export function paintRim(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  ctx.save();
  ctx.lineWidth = rimWidth(at);
  ctx.lineCap = "round";
  ctx.strokeStyle = RIM_INK;
  if (at.charge >= 1) {
    rimPath(ctx, at);
    ctx.stroke();
  } else {
    ctx.globalAlpha = 0.2;
    rimPath(ctx, at);
    ctx.stroke();
    ctx.globalAlpha = 1;
    rimArc(ctx, at, at.charge);
    ctx.stroke();
  }
  ctx.restore();
}
