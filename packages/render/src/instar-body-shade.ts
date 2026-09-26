import { rgba } from "./hex.js";
import { faded } from "./instar-plate.js";
import type { Point } from "./instar-shape.js";
import { PALETTE } from "./palette.js";

/**
 * The body's own light and shadow, top to bottom across its width, one
 * segment of the spine at a time.
 *
 * `lightHide`'s body pass (`instar-hide.ts`) already lights every plate of
 * this hide, and it is right for the skull and the jaw, whose reach along
 * their own light axis is close to their reach across it. THE INSTAR's long
 * body is not: its `Form.r` is its half-length, neck to tail, and its width
 * is a sliver of that — so the same gradient spends nearly all of itself
 * running down the spine and has almost nothing left to spend crossing it,
 * which is why the body read flat while the head three plates over read
 * round. Split out of `instar-profile.ts` to keep that file's own length
 * under the ceiling.
 *
 * `top` always runs along the surface the nests sit on
 * (`instar-profile.ts`'s knots), so it is the lit side by construction;
 * `bottom` gathers the shadow, the way the rest of the hide's own shading
 * does.
 */
export function shadeBody(
  ctx: CanvasRenderingContext2D,
  clip: Path2D,
  top: readonly Point[],
  bottom: readonly Point[],
  fade: number,
): void {
  if (fade <= 0) return;
  ctx.save();
  ctx.clip(clip);
  for (let i = 0; i < top.length - 1; i++) {
    const t0 = top[i] as Point;
    const t1 = top[i + 1] as Point;
    const b0 = bottom[i] as Point;
    const b1 = bottom[i + 1] as Point;
    const quad = new Path2D();
    quad.moveTo(t0.x, t0.y);
    quad.lineTo(t1.x, t1.y);
    quad.lineTo(b1.x, b1.y);
    quad.lineTo(b0.x, b0.y);
    quad.closePath();
    const mt = { x: (t0.x + t1.x) / 2, y: (t0.y + t1.y) / 2 };
    const mb = { x: (b0.x + b1.x) / 2, y: (b0.y + b1.y) / 2 };
    const g = ctx.createLinearGradient(mt.x, mt.y, mb.x, mb.y);
    g.addColorStop(0, rgba(PALETTE.sheenMid, 0.42 * fade));
    g.addColorStop(0.4, rgba(PALETTE.hull, 0.16 * fade));
    g.addColorStop(0.75, rgba(PALETTE.sheenCold, 0.1 * fade));
    g.addColorStop(1, rgba("#0B1024", 0.6 * fade));
    ctx.fillStyle = g;
    ctx.fill(quad);
  }
  ctx.restore();
}

/** The belly: broad plates across the underside, each lit at its front edge
 * and shadowed at its back, the way a snake's run. */
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
