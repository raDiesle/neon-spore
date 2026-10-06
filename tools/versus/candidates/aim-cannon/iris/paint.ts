import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches (`AIM_LOOK.reach`). */
const SCALE = 1.45;
export const REACH = 2.6;

const TEETH = 7;
const TOOTH_N = 10;
const RIM_N = 72;

/** Neon in the ammunition's exact colour over a dark sleeve, a hot thread down its middle. */
function neon(ctx: CanvasRenderingContext2D, p: Path2D, w: number, k: number): void {
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = w + 3;
  ctx.globalAlpha = 0.7;
  ctx.stroke(p);
  ctx.globalAlpha = 1;
  strokeGlow(ctx, p, PALETTE.cyan, w, 2.2 * k, 1, 10);
  ctx.strokeStyle = PALETTE.cyanRim;
  ctx.lineWidth = w * 0.4;
  ctx.stroke(p);
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

/** A living mouth round the target: hooked teeth of cyan neon that open and close, each its own size, on a rim that breathes. */
export function paintIris(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  t: number,
): void {
  const r = ring * SCALE;
  halo(ctx, x, y, r * 2.2, PALETTE.cyan, 0.18 * k);
  const turn = 0.25 * Math.sin(0.6 * t);
  const rim = new Path2D();
  for (let i = 0; i <= RIM_N; i++) {
    const a = (i / RIM_N) * Math.PI * 2;
    const m =
      r *
      (1.55 + 0.07 * Math.sin(TEETH * a - turn * TEETH + 0.5) + 0.04 * Math.sin(4 * a + 1.9 * t));
    if (i === 0) rim.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else rim.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  rim.closePath();
  neon(ctx, rim, 1.4, k);
  const teeth = new Path2D();
  for (let i = 0; i < TEETH; i++) {
    const u = sinHash(i + 3);
    const a = (i / TEETH) * Math.PI * 2 + turn;
    // Each tooth bites on its own beat: open, then in.
    const bite = 0.5 + 0.5 * Math.sin(2.4 * t + i * 0.7);
    const base = r * 1.5;
    const tip = r * (0.62 + 0.3 * bite) * (0.9 + 0.25 * u);
    const hook = 0.9 + 0.4 * u;
    const wide = r * (0.14 + 0.08 * u);
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    for (let j = 0; j <= TOOTH_N; j++) {
      const s = j / TOOTH_N;
      const d = base + (tip - base) * s;
      const ang = a + hook * s * s;
      const cx = x + Math.cos(ang) * d;
      const cy = y + Math.sin(ang) * d;
      const w = wide * Math.sin(Math.PI * Math.min(1, 0.15 + s * 0.85)) * (1 - s * 0.6);
      left.push([cx - Math.sin(ang) * w, cy + Math.cos(ang) * w]);
      right.push([cx + Math.sin(ang) * w, cy - Math.cos(ang) * w]);
    }
    const outline = [...left, ...right.reverse()];
    teeth.moveTo(...(outline[0] as [number, number]));
    for (const [px, py] of outline.slice(1)) teeth.lineTo(px, py);
    teeth.closePath();
  }
  glowFill(ctx, teeth, PALETTE.cyan, PALETTE.cyanRim, k);
}
