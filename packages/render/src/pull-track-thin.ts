import { PALETTE, STROKE } from "./palette.js";
import {
  type PullTrack,
  type PullTrackDraw,
  pullTrackLengths,
  pullTrackPoint,
} from "./pull-track.js";

/** The piece of the spine between two fractions, as one open path. */
function slice(t: PullTrack, from: number, to: number): Path2D {
  const p = new Path2D();
  const steps = Math.max(1, Math.ceil((to - from) * (t.pts.length - 1)));
  for (let i = 0; i <= steps; i++) {
    // Short of a seam by a hair, so a closed loop's last point is not wrapped to its first.
    const k = from + ((to - from) * i) / steps;
    const q = pullTrackPoint(t, i === steps && t.closed && to - from >= 1 ? k - 1e-6 : k);
    if (i === 0) p.moveTo(q.x, q.y);
    else p.lineTo(q.x, q.y);
  }
  return p;
}

/** One stroke of the spine, round-ended, at a width and a colour. */
function stroke(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  color: string,
  width: number,
  alpha: number,
): void {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.globalAlpha = alpha;
  ctx.stroke(p);
}

/** How far apart the chevrons run, in half-widths. */
const CHEVRON_EVERY = 7;

/** How far round a closed track the chevrons reach from the hand, as a share of the loop. */
const CLOSED_REACH = 0.14;

/** Chevrons from `from` towards `to`, drifting the way the hand should go. */
function chevrons(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  from: number,
  to: number,
  time: number,
): void {
  const total = pullTrackLengths(t.pts).at(-1) ?? 0;
  const span = Math.abs(to - from) * total;
  // Closer together on a short run, so a half-channel still says which way;
  // none once there is not room for one.
  const gap = Math.min(t.w * CHEVRON_EVERY, span / 1.5);
  if (span < t.w * 3) return;
  const way = to > from ? 1 : -1;
  const drift = ((time * 1.2) % 1) * gap;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = STROKE.inner;
  for (let d = drift; d < span - gap * 0.3; d += gap) {
    if (d < gap * 0.3) continue;
    const q = pullTrackPoint(t, from + (way * d) / total);
    const fx = q.dx * way;
    const fy = q.dy * way;
    const s = t.w * 0.9;
    ctx.globalAlpha = 0.6 * Math.min(1, (span - d) / gap, d / gap);
    const v = new Path2D();
    v.moveTo(q.x - fx * s - fy * s, q.y - fy * s + fx * s);
    v.lineTo(q.x, q.y);
    v.lineTo(q.x - fx * s + fy * s, q.y - fy * s - fx * s);
    ctx.stroke(v);
  }
}

/** **The thin channel**: every pull's until FIZZ (11 October 2026), and still a
 * turn's — FIZZ's channel draws this one where the track is `closed`. */
export function paintPullTrack(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
): void {
  const whole = slice(t, 0, 1);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  stroke(ctx, whole, o.held ? o.rim : o.hex, t.w * 2 + STROKE.inner * 2, o.held ? 0.7 : 0.45);
  stroke(ctx, whole, PALETTE.background, t.w * 2, 1);
  stroke(ctx, whole, o.hex, t.w * 2, o.held ? 0.25 : 0.12);
  const lo = Math.min(o.origin, o.at);
  const hi = t.closed ? Math.min(lo + 1, Math.max(o.origin, o.at)) : Math.max(o.origin, o.at);
  if (hi - lo > 0.001) stroke(ctx, slice(t, lo, hi), PALETTE.good, t.w * 1.6, 0.95);
  const ahead = (to: number) => chevrons(ctx, t, o.at, to, o.time);
  if (t.closed) {
    // A loop has no end to point at: a stretch ahead of the hand, or both
    // ways from it while it has not gone either way yet.
    if (o.at >= o.origin) ahead(o.at + CLOSED_REACH);
    if (o.at <= o.origin) ahead(o.at - CLOSED_REACH);
  } else if (o.at > o.origin || o.origin <= 0) ahead(1);
  else if (o.at < o.origin || o.origin >= 1) ahead(0);
  else {
    ahead(1);
    ahead(0);
  }
  ctx.restore();
}
