import { halo, strokeGlow } from "../../../../../packages/render/src/glow.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/** How much bigger than the reading's ring this mark is drawn, and how far it then reaches (`AIM_LOOK.reach`). */
const SCALE = 1.3;
export const REACH = 3.2;

const ARMS = 5;
const ARM_N = 16;
const RING_N = 64;

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

/** Five cyan tendrils curling in at the target, waving, each tip a glowing bud, round an uneven ring. */
export function paintTendrils(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ring: number,
  k: number,
  t: number,
): void {
  const r = ring * SCALE;
  halo(ctx, x, y, r * 2.2, PALETTE.cyan, 0.16 * k);
  const loop = new Path2D();
  for (let i = 0; i <= RING_N; i++) {
    const a = (i / RING_N) * Math.PI * 2;
    const m = r * (0.92 + 0.08 * Math.sin(4 * a + 1.5 * t) + 0.05 * Math.sin(6 * a - 2.4 * t));
    if (i === 0) loop.moveTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
    else loop.lineTo(x + Math.cos(a) * m, y + Math.sin(a) * m);
  }
  loop.closePath();
  neon(ctx, loop, 1.6, k);
  const arms = new Path2D();
  const buds: [number, number][] = [];
  for (let i = 0; i < ARMS; i++) {
    const u = sinHash(i + 5);
    const a0 = -Math.PI / 2 + (i / ARMS) * Math.PI * 2 + 0.35 * (u - 0.5);
    const root = r * (2.75 + 0.25 * u);
    const tip = r * (1.3 + 0.12 * Math.sin(1.7 * t + i));
    const wide = r * (0.16 + 0.06 * u);
    const curl = (i % 2 === 0 ? 1 : -1) * (0.45 + 0.3 * u);
    const left: [number, number][] = [];
    const right: [number, number][] = [];
    let ex = 0;
    let ey = 0;
    for (let j = 0; j <= ARM_N; j++) {
      const s = j / ARM_N;
      const d = root + (tip - root) * s;
      // A wave runs down the arm, and the tip curls in.
      const ang = a0 + 0.3 * Math.sin(2.3 * t + i * 1.3 - s * 5) * s + curl * s ** 3 * 0.6;
      const cx = x + Math.cos(ang) * d;
      const cy = y + Math.sin(ang) * d;
      const w = wide * Math.sin(Math.PI * (0.08 + 0.84 * s)) ** 0.7 * (1 - 0.55 * s);
      left.push([cx - Math.sin(ang) * w, cy + Math.cos(ang) * w]);
      right.push([cx + Math.sin(ang) * w, cy - Math.cos(ang) * w]);
      ex = cx;
      ey = cy;
    }
    buds.push([ex, ey]);
    const outline = [...left, ...right.reverse()];
    arms.moveTo(...(outline[0] as [number, number]));
    for (const [px, py] of outline.slice(1)) arms.lineTo(px, py);
    arms.closePath();
  }
  glowFill(ctx, arms, PALETTE.cyan, PALETTE.cyanRim, k);
  const bud = new Path2D();
  for (const [bx, by] of buds) {
    halo(ctx, bx, by, r * 0.7, PALETTE.cyan, 0.6 * k);
    bud.moveTo(bx + r * 0.13, by);
    bud.arc(bx, by, r * 0.13, 0, Math.PI * 2);
  }
  ctx.fillStyle = PALETTE.cyanRim;
  ctx.fill(bud);
}
