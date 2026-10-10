import type { Point } from "@neon-spore/content";
import { PALETTE, type PullTrack, type PullTrackDraw, pullTrackPoint } from "@neon-spore/render";
import { fbm, hash, mix } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **The slime the drop has been pulled out of**: one strand from the start
 * to the drop, thick where it leaves the drop, thin and uneven along the way,
 * bent to the drop where the hand has it off the path — and a few specks of
 * goo left either side of where it went. No row of dots behind it, and none
 * at the start (the owner on OOZE, 10 October 2026), and quiet: *the trail of
 * pulled path must visually not be so much and appearing attention.*
 */

/** Where the strand is `u` of the way from the start to the drop, and the way it runs. */
export function strandPoint(t: PullTrack, o: PullTrackDraw, off: Point, u: number) {
  const q = pullTrackPoint(t, o.origin + (o.at - o.origin) * u);
  return { x: q.x + off.x * u * u, y: q.y + off.y * u * u, dx: q.dx, dy: q.dy };
}

/** The strand's half-width at `u`: a stub at the start, a waist, a neck into the drop. */
function half(u: number, r: number, s: number, time: number, seed: number, p: number): number {
  const neck = 0.62 * u ** 4;
  const stub = 0.2 * (1 - u) ** 6;
  const lumpy = 1 + 0.45 * fbm(s / (r * 1.4) + time * 0.35, seed);
  return r * (0.08 + neck + stub) * lumpy * (1 - 0.3 * p);
}

/** The outline of the strand between `from` and `to` (shares of the way to the drop),
 * pinched to a point at either end that is a break rather than the start or the drop. */
export function strandPath(
  t: PullTrack,
  o: PullTrackDraw,
  off: Point,
  r: number,
  span: { from: number; to: number; seed: number; p: number; pinch?: "from" | "to" },
): Path2D {
  const n = 32;
  const left: Point[] = [];
  const right: Point[] = [];
  const len = Math.hypot(...lengthBetween(t, o.origin, o.at));
  for (let i = 0; i <= n; i++) {
    const u = span.from + ((span.to - span.from) * i) / n;
    const q = strandPoint(t, o, off, u);
    let h = half(u, r, u * len, o.time, span.seed, span.p);
    if (span.pinch === "to") h *= Math.min(1, ((n - i) / n) * 4);
    if (span.pinch === "from") h *= Math.min(1, (i / n) * 4);
    left.push({ x: q.x - q.dy * h, y: q.y + q.dx * h });
    right.push({ x: q.x + q.dy * h, y: q.y - q.dx * h });
  }
  const p = new Path2D();
  for (const [i, q] of left.entries()) {
    if (i === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  for (let i = right.length - 1; i >= 0; i--) {
    const q = right[i] as Point;
    p.lineTo(q.x, q.y);
  }
  p.closePath();
  return p;
}

function lengthBetween(t: PullTrack, a: number, b: number): [number, number] {
  const p = pullTrackPoint(t, a);
  const q = pullTrackPoint(t, b);
  return [q.x - p.x, q.y - p.y];
}

/** A strand, filled faint and edged fainter, so it is there without asking to be looked at. */
export function paintStrand(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  style: GooStyle,
  red: number,
  alpha: number,
): void {
  ctx.save();
  ctx.fillStyle = mix(style.body, PALETTE.red, red);
  ctx.globalAlpha = 0.38 * alpha;
  ctx.fill(p);
  ctx.strokeStyle = mix(style.neon, PALETTE.red, red);
  ctx.globalAlpha = 0.3 * alpha;
  ctx.lineWidth = 0.6;
  ctx.stroke(p);
  ctx.restore();
}

/**
 * Specks of goo left either side of the way the drop came, each where it
 * fell — tied to the distance along the path, so they never move once
 * dropped. Smaller and fainter than anything the hand should look at.
 */
export function specks(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  style: GooStyle,
  alpha: number,
): void {
  const total = Math.hypot(...lengthBetween(t, 0, 1)) || 1;
  const came = Math.abs(o.at - o.origin) * total;
  const way = o.at >= o.origin ? 1 : -1;
  const gap = r * 0.75;
  ctx.save();
  ctx.fillStyle = style.body;
  for (let i = 0; i * gap < came - r * 1.4; i++) {
    const s = (i + hash(i * 1.7)) * gap;
    if (s > came - r * 1.4) break;
    const q = pullTrackPoint(t, o.origin + (way * s) / total);
    const side = (hash(i * 3.7 + 1) - 0.5) * 2 * r * 0.95;
    const size = r * (0.04 + 0.08 * hash(i * 5.3 + 2));
    ctx.globalAlpha = alpha * (0.2 + 0.25 * hash(i * 9.1));
    ctx.beginPath();
    ctx.ellipse(
      q.x - q.dy * side,
      q.y + q.dx * side,
      size * 1.3,
      size,
      hash(i) * 3,
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
  ctx.restore();
}
