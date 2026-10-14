import { strokeGlowFaded } from "./glow.js";
import { rgba } from "./hex.js";
import { glow } from "./hydra-head.js";
import type { At } from "./hydra-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE HYDRA's flesh** (§11.64): a neck — a living tube, tapering from the
 * body to the head, banded with scales and a paler belly line down it,
 * rippling as it breathes — with a serpent's head on the end of it
 * (`hydra-head.ts`).
 *
 * A neck can be **cut part way**: a gash across it at the depth the swipe has
 * reached, the violet ichor showing through, so the pair sees the cut go in
 * (`drawNeck`'s `gash`).
 */

/** A neck's run: from its root to its end, how it bows on the way, and how thick each end is. */
export interface Neck {
  from: At;
  to: At;
  /** Where the neck sets off toward and comes in from, as offsets from each end, in pixels. */
  out: At;
  into: At;
  /** Thickness at the root and at the head, in pixels. */
  w0: number;
  w1: number;
}

/** Samples down a neck. */
const SAMPLES = 20;

/** The point `t` (0..1) along a neck, root to head. */
export function neckAt(n: Neck, t: number): At {
  const u = 1 - t;
  const a = { x: n.from.x + n.out.x, y: n.from.y + n.out.y };
  const b = { x: n.to.x + n.into.x, y: n.to.y + n.into.y };
  return {
    x: u * u * u * n.from.x + 3 * u * u * t * a.x + 3 * u * t * t * b.x + t * t * t * n.to.x,
    y: u * u * u * n.from.y + 3 * u * u * t * a.y + 3 * u * t * t * b.y + t * t * t * n.to.y,
  };
}

/** Which way the neck runs at `t`, radians on the screen. */
export function neckAngle(n: Neck, t: number): number {
  const a = neckAt(n, Math.max(0, t - 0.02));
  const b = neckAt(n, Math.min(1, t + 0.02));
  return Math.atan2(b.y - a.y, b.x - a.x);
}

/**
 * The neck drawn root to head, `upTo` of it (a stump stops short), rippling
 * on `time`; a `gash` (0..1) cut across it at `cut` along. Answers its outline.
 */
export function drawNeck(
  ctx: CanvasRenderingContext2D,
  n: Neck,
  tile: number,
  time: number,
  upTo = 1,
  gash = 0,
  cut = 0.78,
): Path2D {
  const mid: At[] = [];
  const widths: number[] = [];
  for (let j = 0; j <= SAMPLES; j++) {
    const t = (j / SAMPLES) * upTo;
    const p = neckAt(n, t);
    const a = neckAngle(n, t);
    const sway = Math.sin(t * 7 - time * 2.6) * tile * 0.09 * Math.sin(Math.PI * t);
    const notch = gash > 0 ? 1 - 0.55 * gash * Math.max(0, 1 - Math.abs(t - cut) * 14) : 1;
    mid.push({ x: p.x - Math.sin(a) * sway, y: p.y + Math.cos(a) * sway });
    widths.push((n.w0 + (n.w1 - n.w0) * t) * notch);
  }
  const tube = drawFlesh(ctx, mid, widths, tile);
  if (gash > 0 && upTo >= cut) drawGash(ctx, n, tile, cut, gash);
  return tube;
}

/**
 * A length of the hydra's flesh down `mid`, `widths` thick at each point: its
 * shadow, its hide, the belly line down it, a band of scales every so far and
 * its glowing edge. A neck and a coil are both drawn with it. Answers its outline.
 */
export function drawFlesh(
  ctx: CanvasRenderingContext2D,
  mid: readonly At[],
  widths: readonly number[],
  tile: number,
): Path2D {
  const left: At[] = [];
  const right: At[] = [];
  for (let j = 0; j < mid.length; j++) {
    const p = mid[j] as At;
    const a = Math.atan2(
      (mid[Math.min(mid.length - 1, j + 1)] as At).y - (mid[Math.max(0, j - 1)] as At).y,
      (mid[Math.min(mid.length - 1, j + 1)] as At).x - (mid[Math.max(0, j - 1)] as At).x,
    );
    const w = (widths[j] ?? 0) / 2;
    left.push({ x: p.x - Math.sin(a) * w, y: p.y + Math.cos(a) * w });
    right.push({ x: p.x + Math.sin(a) * w, y: p.y - Math.cos(a) * w });
  }
  const tube = new Path2D();
  tube.moveTo(left[0]?.x ?? 0, left[0]?.y ?? 0);
  for (const p of left) tube.lineTo(p.x, p.y);
  for (let j = right.length - 1; j >= 0; j--) tube.lineTo(right[j]?.x ?? 0, right[j]?.y ?? 0);
  tube.closePath();
  ctx.save();
  ctx.translate(0, tile * 0.1);
  ctx.fillStyle = PALETTE.hydraHideDark;
  ctx.fill(tube);
  ctx.restore();
  ctx.fillStyle = PALETTE.hydraHide;
  ctx.fill(tube);
  ctx.save();
  ctx.clip(tube);
  // The belly line down the near side, and a band of scales every so far.
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.hydraScale, 0.32);
  ctx.lineWidth = Math.max(1, (widths[widths.length - 1] ?? 0) * 0.3);
  ctx.beginPath();
  ctx.moveTo(mid[0]?.x ?? 0, mid[0]?.y ?? 0);
  for (const p of mid) ctx.lineTo(p.x, p.y);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.hydraHideDark, 0.55);
  ctx.lineWidth = STROKE.inner;
  for (let j = 1; j < mid.length - 1; j += 2) {
    const l = left[j] as At;
    const r = right[j] as At;
    const m = mid[j + 1] as At;
    ctx.beginPath();
    ctx.moveTo(l.x, l.y);
    ctx.quadraticCurveTo(m.x, m.y, r.x, r.y);
    ctx.stroke();
  }
  ctx.restore();
  strokeGlowFaded(ctx, tube, PALETTE.hydraScale, STROKE.outline, 0.8);
  return tube;
}

/** The cut going in across the neck: a dark slash with the ichor showing in it. */
function drawGash(ctx: CanvasRenderingContext2D, n: Neck, tile: number, t: number, gash: number) {
  const p = neckAt(n, t);
  const a = neckAngle(n, t) + Math.PI / 2;
  const w = ((n.w0 + (n.w1 - n.w0) * t) / 2) * (0.4 + 0.7 * gash);
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.hydraStump;
  ctx.lineWidth = tile * 0.12;
  ctx.beginPath();
  ctx.moveTo(p.x - Math.cos(a) * w, p.y - Math.sin(a) * w);
  ctx.lineTo(p.x + Math.cos(a) * w, p.y + Math.sin(a) * w);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.hydraIchor;
  ctx.lineWidth = tile * 0.05;
  ctx.stroke();
  ctx.restore();
  glow(ctx, p, tile * (0.4 + 0.4 * gash), PALETTE.hydraIchor, 0.5 * gash);
}
