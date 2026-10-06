import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches (`AIM_LOOK.reach`). */
const SCALE = 1.35;
export const REACH = 2.95;

/** Points round the ring, and along a fang. */
const RING_N = 72;
const FANG_N = 12;

/** A ring that never sits still: three slow waves round it, each at its own speed. */
function ringR(a: number, t: number): number {
  return (
    1 +
    0.1 * Math.sin(3 * a + 1.7 * t) +
    0.06 * Math.sin(5 * a - 2.3 * t + 1) +
    0.04 * Math.sin(8 * a + 3.1 * t + 2)
  );
}

/** A tube of neon: the glow and the body in the ammunition's exact colour, a hot thread down its middle. */
function neon(ctx: CanvasRenderingContext2D, p: Path2D, w: number, k: number): void {
  // A dark sleeve under the tube, so red reads even on a red target.
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = w + 3;
  ctx.globalAlpha = 0.7;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, p, PALETTE.red, w, 2.2 * k, 1, 10);
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = w * 0.4;
  ctx.globalAlpha = 0.9;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
}

/** A solid of neon: a soft dark shadow so it reads on a target of its own colour, its glow, its body in the exact colour, a hot edge. */
function glowFill(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  hex: string,
  rim: string,
  k: number,
): void {
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.35;
  ctx.stroke(p);
  strokeGlow(ctx, p, hex, 0.8, 2.4 * k, 0.9, 9);
  ctx.globalAlpha = 0.8 + 0.2 * k;
  ctx.fillStyle = hex;
  ctx.fill(p);
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = rim;
  ctx.lineWidth = 0.6;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
}

/** A wobbling ring of red neon pierced by four curved fangs that sway and reach in at the target. */
export function paintEmber(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  t: number,
): void {
  const r = ring * SCALE;
  halo(ctx, x, y, r * 2.6, PALETTE.red, 0.2 * k);
  const loop = new Path2D();
  for (let i = 0; i <= RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2;
    const m = r * ringR(a, t);
    if (i === 0) loop.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else loop.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  loop.closePath();
  neon(ctx, loop, 2.4, k);
  const fangs = new Path2D();
  for (let q = 0; q < 4; q++) {
    const a = (q * Math.PI) / 2 + Math.PI / 4 + 0.14 * Math.sin(1.3 * t + q * 1.9);
    const base = r * (2.1 + 0.15 * Math.sin(2.1 * t + q));
    const tip = r * (1.12 + 0.08 * Math.sin(2.7 * t + q * 2.4));
    const bend = r * (0.22 + 0.1 * Math.sin(1.1 * t + q * 0.8));
    const wide = r * (0.2 + 0.05 * ((q * 7) % 3));
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let i = 0; i <= FANG_N; i++) {
      const s = i / FANG_N;
      const d = base + (tip - base) * s;
      const side = bend * s * s;
      const cx = x + Math.cos(a) * d - Math.sin(a) * side;
      const cy = y + Math.sin(a) * d + Math.cos(a) * side;
      const w = wide * (1 - s) ** 1.6;
      left.push([cx - Math.sin(a) * w, cy + Math.cos(a) * w]);
      right.push([cx + Math.sin(a) * w, cy - Math.cos(a) * w]);
    }
    const outline = [...left, ...right.reverse()];
    fangs.moveTo(...(outline[0] as [number, number]));
    for (const [px, py] of outline.slice(1)) fangs.lineTo(px, py);
    fangs.closePath();
  }
  glowFill(ctx, fangs, PALETTE.red, PALETTE.redRim, k);
}
