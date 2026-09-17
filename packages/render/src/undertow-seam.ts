import type { Point } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import type { SurfaceY } from "./hull-frame.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";
import { BOW_TILES } from "./undertow-shape.js";

/**
 * THE UNDERTOW's seam: the skin lifted between two x's, the violet light
 * under it, and a plate bowing drawn out of the two.
 *
 * Split off `undertow-draw.ts` on the day the plate closing became a picture
 * (`undertow-fx.ts`): a plate settling back is the same plate that bowed,
 * drawn with the lift running the other way, and the two files that draw it
 * — one off the world, one off a transient — have to be drawing the same
 * thing or the close would read as a different plate.
 *
 * **Violet, through the seams.** The light is `hull`, the ship's own colour,
 * which is the fiction the design asks for. Nothing here is held between
 * frames.
 */

/** A slow unsteady pulse for the light, off the frame clock; the same on both screens. */
export function flicker(time: number): number {
  return 0.5 + 0.5 * Math.sin(time * 7.3) * Math.sin(time * 2.1);
}

/**
 * The skin between two screen x's, lifted by a raised-cosine window — the
 * plate as it bows — as an open run of points, left to right.
 */
export function lifted(x0: number, x1: number, lift: number, surfaceY: SurfaceY): Point[] {
  const pts: Point[] = [];
  const n = 10;
  for (let i = 0; i <= n; i++) {
    const f = i / n;
    const x = x0 + (x1 - x0) * f;
    pts.push({ x, y: surfaceY(x) - lift * 0.5 * (1 - Math.cos(f * Math.PI * 2)) });
  }
  return pts;
}

/** The same run along the skin itself, right to left, to close a light against it. */
function along(x0: number, x1: number, surfaceY: SurfaceY): Point[] {
  const pts: Point[] = [];
  for (let i = 10; i >= 0; i--) {
    const x = x0 + (x1 - x0) * (i / 10);
    pts.push({ x, y: surfaceY(x) });
  }
  return pts;
}

/**
 * The light under a lifted plate: filled additively between the skin and the
 * plate's underside, so it reads as light through a seam rather than as a
 * second hull painted over the first.
 */
export function seamLight(
  ctx: CanvasRenderingContext2D,
  plate: Point[],
  x0: number,
  x1: number,
  alpha: number,
  surfaceY: SurfaceY,
): void {
  const light = splinePath([...plate, ...along(x0, x1, surfaceY)], true);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = alpha;
  ctx.fillStyle = PALETTE.hull;
  ctx.fill(light);
  ctx.restore();
}

/**
 * One plate bowing up under the pilot's eye: the seam lit, the rim lifted, a
 * glow at each end. `x` and `half` are in stage pixels, `lift` 0..1 of
 * `BOW_TILES`.
 */
export function drawPlateBow(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  half: number,
  lift: number,
  time: number,
  surfaceY: SurfaceY,
): void {
  if (lift <= 0) return;
  const plate = lifted(x - half, x + half, BOW_TILES * l.tile * lift, surfaceY);
  seamLight(ctx, plate, x - half, x + half, 0.25 + 0.3 * lift, surfaceY);
  strokeGlow(ctx, splinePath(plate, false), PALETTE.hullRim, STROKE.inner, 0.3 + 0.6 * lift);
  const glow = (0.2 + 0.4 * lift) * (0.7 + 0.3 * flicker(time));
  halo(ctx, x - half, surfaceY(x - half), l.tile * 0.35, PALETTE.hull, glow);
  halo(ctx, x + half, surfaceY(x + half), l.tile * 0.35, PALETTE.hull, glow);
}
