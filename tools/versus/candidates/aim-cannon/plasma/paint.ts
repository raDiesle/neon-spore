import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches (`AIM_LOOK.reach`). */
const SCALE = 1.3;
export const REACH = 3.1;

const LICKS = 26;
const LICK_N = 8;
const RING_N = 72;

/** A ring of red fire round the target: flames that flicker and lean as they turn, over a lumpy neon core. */
export function paintPlasma(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  t: number,
): void {
  const r = ring * SCALE;
  halo(ctx, x, y, r * 2.6, PALETTE.red, 0.22 * k);
  const base = (a: number) =>
    r * (1.12 + 0.07 * Math.sin(4 * a + 2 * t) + 0.04 * Math.sin(9 * a - 3.3 * t));
  const flames = new Path2D();
  for (let i = 0; i < LICKS; i++) {
    const u = sinHash(i + 9);
    const a = (i / LICKS) * Math.PI * 2 + 0.05 * Math.sin(3 * t + i);
    const flick = 0.5 + 0.5 * Math.sin(t * (4 + 4 * u) + i * 1.7);
    const len = r * (0.3 + 0.8 * flick * (0.5 + 0.5 * u));
    const lean = 0.35 + 0.15 * Math.sin(2 * t + i);
    const wide = r * (0.1 + 0.07 * u);
    const b = base(a);
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let j = 0; j <= LICK_N; j++) {
      const s = j / LICK_N;
      const d = b + len * s;
      const ang = a + (lean * s * s * len) / r;
      const cx = x + Math.cos(ang) * d;
      const cy = y + Math.sin(ang) * d;
      const w = wide * (1 - s) ** 0.8;
      left.push([cx - Math.sin(ang) * w, cy + Math.cos(ang) * w]);
      right.push([cx + Math.sin(ang) * w, cy - Math.cos(ang) * w]);
    }
    const outline = [...left, ...right.reverse()];
    flames.moveTo(...(outline[0] as [number, number]));
    for (const [px, py] of outline.slice(1)) flames.lineTo(px, py);
    flames.closePath();
  }
  const prev = ctx.globalCompositeOperation;
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.45 + 0.35 * k;
  ctx.fillStyle = PALETTE.red;
  ctx.fill(flames);
  ctx.globalCompositeOperation = prev;
  ctx.globalAlpha = 1;
  strokeGlow(ctx, flames, PALETTE.red, 0.8, 1.2 * k, 0.7, 6);
  const core = new Path2D();
  for (let i = 0; i <= RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2;
    const m = base(a);
    if (i === 0) core.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else core.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  core.closePath();
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = 5;
  ctx.globalAlpha = 0.6;
  ctx.stroke(core);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, core, PALETTE.red, 2.4, 2.4 * k, 1, 10);
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineWidth = 1;
  ctx.stroke(core);
}
