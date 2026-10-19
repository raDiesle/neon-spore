import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { RIM_INK, rimPath, rimWidth } from "../geometry.js";

/** How faint the ring is the moment a lock is spent. */
const FLOOR = 0.1;

/**
 * The ring is always there and only its strength changes: almost nothing the
 * moment a lock is spent, warming slowly through the rest — most of the
 * warming in its last second — and full yellow when it is ready.
 */
export function paintFade(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  const c = Math.min(1, at.charge);
  ctx.save();
  ctx.globalAlpha = FLOOR + (1 - FLOOR) * c * c * c;
  ctx.lineWidth = rimWidth(at);
  ctx.strokeStyle = RIM_INK;
  rimPath(ctx, at);
  ctx.stroke();
  ctx.restore();
}
