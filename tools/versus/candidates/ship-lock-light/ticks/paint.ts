import type { LockLightAt } from "../../../../../packages/render/src/lock-light-look.js";
import { RIM_INK, rimPath, rimWidth } from "../geometry.js";

/** One tick a second of the four-second rest. */
const TICKS = 4;
/** Each tick's length, as a share of the ring. */
const TICK_SHARE = 0.09;

/**
 * Four short yellow marks on the ring — top, right, bottom, left — one lit
 * for each second of the rest, like the quarter marks of a clock. When the
 * rest has run they close into the whole ring.
 */
export function paintTicks(ctx: CanvasRenderingContext2D, at: LockLightAt): void {
  ctx.save();
  ctx.lineWidth = rimWidth(at);
  ctx.lineCap = "round";
  ctx.strokeStyle = RIM_INK;
  if (at.charge >= 1) {
    rimPath(ctx, at);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const lit = Math.floor(at.charge * TICKS);
  const rx = at.mouthRx + at.tile * 0.07;
  const ry = at.mouthRy + at.tile * 0.07;
  const half = Math.PI * TICK_SHARE;
  for (let i = 0; i < lit; i++) {
    // A quarter turn each, from twelve o'clock clockwise.
    const mid = (i / TICKS) * Math.PI * 2 - Math.PI / 2;
    ctx.beginPath();
    ctx.ellipse(at.x, at.mouthY, rx, ry, 0, mid - half, mid + half);
    ctx.stroke();
  }
  ctx.restore();
}
