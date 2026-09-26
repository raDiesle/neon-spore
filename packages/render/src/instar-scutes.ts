import type { Point } from "./instar-place.js";
import { faded } from "./instar-plate.js";
import { PALETTE } from "./palette.js";

/**
 * THE INSTAR's belly plates side-on: a short dark notch in from the belly
 * edge at each sample of the spine, with a thin lit line beside it, so the
 * underside reads as plated rather than as a smooth hem. Split out of
 * `instar-profile.ts` to keep that file's own length under the ceiling.
 */
export function drawScutes(
  ctx: CanvasRenderingContext2D,
  bottom: readonly Point[],
  spine: readonly Point[],
  r: number,
  fade: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.03);
  for (let i = 1; i < spine.length - 2; i++) {
    const b = bottom[i] as Point;
    const s = spine[i] as Point;
    const inner = { x: b.x + (s.x - b.x) * 0.45, y: b.y + (s.y - b.y) * 0.45 };
    ctx.strokeStyle = faded(PALETTE.background, fade, 0.55);
    ctx.beginPath();
    ctx.moveTo(b.x, b.y);
    ctx.lineTo(inner.x, inner.y);
    ctx.stroke();
    ctx.strokeStyle = faded(PALETTE.hullRim, fade, 0.18);
    ctx.beginPath();
    ctx.moveTo(b.x - r * 0.03, b.y);
    ctx.lineTo(inner.x - r * 0.03, inner.y);
    ctx.stroke();
  }
  ctx.restore();
}
