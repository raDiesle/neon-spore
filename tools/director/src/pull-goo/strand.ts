import type { Point } from "@neon-spore/content";
import { PALETTE, type PullTrack, pullTrackPoint } from "@neon-spore/render";
import { fbm, hash, mix } from "./noise.js";

/**
 * **What is left behind the drop**: the tail it is pulled out of — JELLY's,
 * the owner's pick, thick where it leaves the drop and thin and uneven along
 * the way, in green — and small green specks either side of where it went.
 * No dots behind the drop, and none at the start.
 */

/** A stretch of path from `origin` to the drop at `at`, bent to the drop's `off`. */
export interface Run {
  readonly t: PullTrack;
  readonly origin: number;
  readonly at: number;
  readonly off: Point;
}

/** Where a run is `u` of the way from its start to the drop, and the way it heads. */
export function runPoint(run: Run, u: number) {
  const q = pullTrackPoint(run.t, run.origin + (run.at - run.origin) * u);
  return { x: q.x + run.off.x * u * u, y: q.y + run.off.y * u * u, dx: q.dx, dy: q.dy };
}

/** The outline either side of a run, `half(u, s)` wide at `u`, `s` pixels along it. */
function outline(run: Run, from: number, to: number, half: (u: number, s: number) => number) {
  const n = 32;
  const a = pullTrackPoint(run.t, run.origin);
  const b = pullTrackPoint(run.t, run.at);
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const u = from + ((to - from) * i) / n;
    const q = runPoint(run, u);
    const h = half(u, u * len);
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

/** The tail: a stub at the start, a thin uneven waist, a neck swelling into the drop.
 * `taut` thins it, as a pull at full stretch or a sling about to let go does. */
export function tailPath(run: Run, r: number, time: number, taut = 0): Path2D {
  return outline(run, 0, 1, (u, s) => {
    const neck = 0.62 * u ** 4;
    const stub = 0.2 * (1 - u) ** 6;
    const lumpy = 1 + 0.45 * fbm(s / (r * 1.4) + time * 0.35, 3);
    return r * (0.08 + neck + stub) * lumpy * (1 - 0.45 * taut);
  });
}

/**
 * The tail, filled and edged in `color` — the count's green while it is
 * pulled, the refusal's red when it fails: one tail and no smear under it,
 * the owner, 10 October 2026: *remaining tail should only be in green colour
 * and a single one, not both*. `red` washes it towards red as the drop nears
 * the edge of the path.
 */
export function paintTail(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  color: string,
  red: number,
  alpha: number,
): void {
  ctx.save();
  ctx.fillStyle = mix(color, PALETTE.red, red);
  ctx.globalAlpha = 0.55 * alpha;
  ctx.fill(p);
  ctx.strokeStyle = mix(mix(color, "#FFFFFF", 0.3), PALETTE.red, red);
  ctx.globalAlpha = 0.75 * alpha;
  ctx.lineWidth = 0.8;
  ctx.stroke(p);
  ctx.restore();
}

/**
 * Small green specks either side of the way the drop came, each where it
 * fell — tied to the distance along the path, so they never move once
 * dropped. Quiet: never brighter than the drop's own rim.
 */
export function specks(ctx: CanvasRenderingContext2D, run: Run, r: number, alpha: number): void {
  if (alpha <= 0 || Math.abs(run.at - run.origin) < 0.005) return;
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  const a = pullTrackPoint(run.t, run.origin);
  const b = pullTrackPoint(run.t, run.at);
  const came = Math.hypot(b.x - a.x, b.y - a.y);
  const gap = r * 0.75;
  for (let i = 0; (i + 1) * gap < came - r; i++) {
    const u = ((i + hash(i * 1.7)) * gap) / came;
    const q = runPoint(run, u);
    const side = (hash(i * 3.7 + 1) - 0.5) * 2 * r * 0.8;
    const size = r * (0.04 + 0.07 * hash(i * 5.3 + 2));
    ctx.globalAlpha = alpha * (0.3 + 0.35 * hash(i * 9.1));
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
