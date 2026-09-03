import { halo } from "./glow.js";
import type { Layout } from "./layout.js";

/** Core and trailing filaments. Inner drawing is thinner than the outline
 * (docs/spec/graphics.md). */
export function drawDetails(
  ctx: CanvasRenderingContext2D,
  isBulb: boolean,
  rx: number,
  ry: number,
  rim: string,
): void {
  ctx.fillStyle = rim;
  if (isBulb) {
    ctx.beginPath();
    ctx.arc(0, ry * 0.3, ry * 0.09, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.arc(-rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** The pod wreck's trail (`drawWreck` in pods.ts), in the creature's own
 * colour: fading halos strung out behind — up, since row only grows toward
 * the hull. */
export function drawMotionTrail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  hex: string,
  t: number,
): void {
  for (let k = 1; k <= 2; k++) {
    const a = (1 - k / 5) * 0.4;
    const ty = y - k * l.tile * 0.26;
    const tx = x - Math.sin(t * 3 + k) * l.tile * 0.05 * k;
    halo(ctx, tx, ty, r * (0.85 - k * 0.12), hex, a * 0.5);
  }
}
