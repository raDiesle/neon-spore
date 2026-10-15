import { blisterStrokes, blisterSwipeShare, blisterWayOf } from "@neon-spore/sim";
import type { BlisterFrame } from "./blister-bodies.js";
import type { Body } from "./creature-body-in.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

const TAU = Math.PI * 2;

/** Discs along the tail: enough that they run together into one limb. */
const STEPS = 28;

/**
 * CURL, one of COMBO's two bodies (`blister-combo.ts`): a round slime up out
 * of the pore with the press on its back and its tail wound into a tight
 * curl against its side, two eyes over the button. The press frees the tail: it runs out along the pull's channel to the knob
 * as far as the thumb has drawn it, its tip under the knob — the creature's
 * own tail being pulled.
 */
export function drawCurlBody(b: Body, f: BlisterFrame): void {
  const { ctx } = b;
  const r = f.r;
  const x = b.x;
  const y = b.y + (1 - f.rise) * r * 1.8;
  const way = WAY[blisterWayOf(b.c)];
  const pts = blisterStrokes(b.c) ? drawn(b, x, y, r, way) : wound(x, y, r, way, b.time);
  ctx.save();
  limb(ctx, pts, r);
  const body = new Path2D();
  body.ellipse(x, y + r * 0.05, r * 1.35, r * 1.25, 0, 0, TAU);
  const g = ctx.createRadialGradient(x - r * 0.4, y - r * 0.6, r * 0.1, x, y, r * 1.45);
  g.addColorStop(0, rgba(PALETTE.hull, 0.95));
  g.addColorStop(0.6, rgba(PALETTE.hull, 0.55));
  g.addColorStop(1, PALETTE.redDark);
  ctx.fillStyle = g;
  ctx.fill(body);
  ctx.lineWidth = Math.max(1.5, r * 0.1);
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.stroke(body);
  for (const side of [-1, 1] as const) eye(ctx, x + side * r * 0.5, y - r * 1.05, r);
  ctx.restore();
}

type Way = { readonly dx: number; readonly dy: number };
type Pt = { x: number; y: number; w: number };

/** Wound: from under the body's flank, round three half turns into a curl at its side. */
function wound(x: number, y: number, r: number, way: Way, time: number): Pt[] {
  const cx = x + way.dx * r * 1.55 - way.dy * r * 0.2;
  const cy = y + way.dy * r * 1.55 + way.dx * r * 0.35;
  const breathe = 1 + Math.sin(time * 2.6) * 0.04;
  const pts: Pt[] = [];
  for (let i = 0; i <= STEPS; i++) {
    const t = i / STEPS;
    const a = Math.atan2(way.dy, way.dx) + Math.PI + t * Math.PI * 3;
    const rad = r * (0.7 - 0.55 * t) * breathe;
    pts.push({ x: cx + Math.cos(a) * rad, y: cy + Math.sin(a) * rad, w: r * (0.3 - 0.2 * t) });
  }
  return pts;
}

/** Drawn: out along the way to the knob, a little slack, tapering to its tip under it. */
function drawn(b: Body, x: number, y: number, r: number, way: Way): Pt[] {
  const reach = Math.max(r * 1.6, b.l.tile * blisterSwipeShare(b.world, b.c));
  const tx = b.x + way.dx * reach;
  const ty = b.y + way.dy * reach;
  const fx = x + way.dx * r * 0.9;
  const fy = y + way.dy * r * 0.9 + way.dx * r * 0.35;
  const slack = r * 0.35;
  const pts: Pt[] = [];
  const run = STEPS;
  for (let i = 0; i <= run; i++) {
    const t = i / run;
    const sag = Math.sin(t * Math.PI) * slack;
    pts.push({
      x: fx + (tx - fx) * t - way.dy * sag,
      y: fy + (ty - fy) * t + way.dx * sag,
      w: r * (0.3 - 0.2 * t),
    });
  }
  return pts;
}

/** The tail: a rim a little wider, then the flesh over it, so the discs run together. */
function limb(ctx: CanvasRenderingContext2D, pts: Pt[], r: number): void {
  const rim = Math.max(1.2, r * 0.08);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  for (const p of pts) disc(ctx, p.x, p.y, p.w + rim);
  ctx.fillStyle = PALETTE.hull;
  for (const p of pts) disc(ctx, p.x, p.y, p.w);
}

/** One eye, looking down at the button on its back. */
function eye(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.ellipse(x, y, r * 0.24, r * 0.28, 0, 0, TAU);
  ctx.fillStyle = PALETTE.text;
  ctx.fill();
  ctx.lineWidth = Math.max(1, r * 0.06);
  ctx.strokeStyle = PALETTE.redDark;
  ctx.stroke();
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.arc(x, y + r * 0.08, r * 0.12, 0, TAU);
  ctx.fill();
}

function disc(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, TAU);
  ctx.fill();
}

const WAY = {
  down: { dx: 0, dy: 1 },
  up: { dx: 0, dy: -1 },
  right: { dx: 1, dy: 0 },
  left: { dx: -1, dy: 0 },
} as const;
