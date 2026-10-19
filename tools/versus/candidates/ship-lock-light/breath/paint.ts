import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { RIM_INK, rimPath, rimWidth } from "../geometry.js";

/**
 * Nothing while the lock rests. Ready, the ring round the egg wears a soft
 * yellow glow under its thin line, and the glow breathes once a beat — the
 * one answer here that moves, so a ready lock is caught out of the corner of
 * an eye rather than looked for.
 */
export function paintBreath(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  if (at.charge < 1) return;
  const swell = 0.5 + 0.5 * Math.cos(at.beatPhase * Math.PI * 2);
  ctx.save();
  ctx.strokeStyle = RIM_INK;
  ctx.globalAlpha = 0.15 + 0.25 * swell;
  ctx.lineWidth = rimWidth(at) * (2.5 + 1.5 * swell);
  rimPath(ctx, at);
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.lineWidth = rimWidth(at);
  ctx.stroke();
  ctx.restore();
}
