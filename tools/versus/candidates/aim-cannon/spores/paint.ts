import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches (`AIM_LOOK.reach`). */
const SCALE = 1.35;
export const REACH = 2.75;

const SPORES = 15;
const RING_N = 64;

/** A swarm of glowing red spores circling the target, each at its own speed and size, trailing light, round a breathing thread. */
export function paintSpores(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  t: number,
): void {
  const r = ring * SCALE;
  halo(ctx, x, y, r * 2.4, PALETTE.red, 0.16 * k);
  const thread = new Path2D();
  for (let i = 0; i <= RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2;
    const m = r * (0.95 + 0.07 * Math.sin(3 * a - 1.3 * t) + 0.05 * Math.sin(7 * a + 2.1 * t));
    if (i === 0) thread.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else thread.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  thread.closePath();
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = 4;
  ctx.globalAlpha = 0.6;
  ctx.stroke(thread);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, thread, PALETTE.red, 1.6, 2 * k, 1, 9);
  const trails = new Path2D();
  const dots: [number, number, number][] = [];
  for (let i = 0; i < SPORES; i++) {
    const u = sinHash(i + 1);
    const speed = 0.7 + 0.9 * u;
    const a = (i / SPORES) * Math.PI * 2 + t * speed;
    const m = r * (1.4 + 0.22 * Math.sin(1.9 * t + i * 2.3) + 0.12 * u);
    const size = (1.4 + 2.6 * u) * (0.8 + 0.2 * Math.sin(5 * t + i));
    const px = x + Math.cos(a) * m;
    const py = y + Math.sin(a) * m;
    dots.push([px, py, size]);
    const tail = 0.35 + 0.3 * u;
    trails.moveTo(px, py);
    trails.arc(x, y, m, a, a - tail, true);
  }
  strokeGlow(ctx, trails, PALETTE.red, 1, 1.4 * k, 0.55, 6);
  for (const [px, py, size] of dots) halo(ctx, px, py, size * 3.2, PALETTE.red, 0.55 * k);
  const body = new Path2D();
  for (const [px, py, size] of dots) {
    body.moveTo(px + size, py);
    body.arc(px, py, size, 0, Math.PI * 2);
  }
  ctx.fillStyle = PALETTE.red;
  ctx.fill(body);
  const core = new Path2D();
  for (const [px, py, size] of dots) {
    core.moveTo(px + size * 0.45, py);
    core.arc(px, py, size * 0.45, 0, Math.PI * 2);
  }
  ctx.fillStyle = PALETTE.redRim;
  ctx.fill(core);
}
