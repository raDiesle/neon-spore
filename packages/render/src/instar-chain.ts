import { blobPoints } from "@neon-spore/content";
import { drawPlate, faded } from "./instar-draw.js";
import { type Figure, instarChainTop, type Point } from "./instar-shape.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * The chain up out of the frame: four segments from above the top of the
 * grid down to the back of the head, each a little bigger than the last,
 * swaying with the beat. Returns the two shoulders the arms hang from.
 *
 * Cut out of `instar-draw.ts` at its line limit, and the seam is the chain
 * because the chain is the one part of the body hung from a point outside
 * it (`instarChainTop`), which the slow window measures too.
 */
export function drawInstarChain(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: Figure,
  head: Point,
  r: number,
  time: number,
  fade: number,
  hurt = 0,
): [Point, Point] {
  const top = instarChainTop(l);
  const sway = Math.sin(time * 1.3) * r * 0.08;
  let shoulders: [Point, Point] = [head, head];
  for (let k = 1; k <= 4; k++) {
    const t = k / 5;
    const cx = top.x + (head.x - top.x) * t + sway * (1 - t);
    const cy = top.y + (head.y - top.y) * t;
    const rad = r * (0.45 + 0.4 * t);
    const p = splinePath(blobPoints(cx, cy, rad, rad * 0.75, 5, 0.06, 0.02, time, k, 24), true);
    drawPlate(ctx, p, fade, 0.35, hurt);
    // A ridge across each plate, brighter on the turned back.
    ctx.save();
    ctx.strokeStyle = faded(PALETTE.hullRim, fade, 0.35 + 0.4 * f.back);
    ctx.lineWidth = STROKE.inner;
    ctx.beginPath();
    ctx.moveTo(cx - rad * 0.6, cy + rad * 0.2);
    ctx.quadraticCurveTo(cx, cy + rad * 0.45, cx + rad * 0.6, cy + rad * 0.2);
    ctx.stroke();
    ctx.restore();
    if (k === 3)
      shoulders = [
        { x: cx - rad * 0.8, y: cy },
        { x: cx + rad * 0.8, y: cy },
      ];
  }
  return shoulders;
}
