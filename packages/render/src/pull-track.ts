import type { Point } from "@neon-spore/content";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A pull is drawn as the way the hand goes, not as a place to press.**
 *
 * THE INSTAR's swipe learnt it first (`instar-track.ts`): the owner, 24
 * September 2026, generic — *instead of a circle for swiping in a direction
 * it should be visual like … a slider*. On 25 September he asked the same of
 * the handles you pull: *change the circle to look like the path it can be
 * pulled*, THE MAZE's and THE WARDEN's alike, and in green. So a pull handle
 * wears a channel along the whole of its travel — from where the hand takes
 * hold to where the pull is full — and the channel fills **green** behind the
 * hand as the pull goes in. The end of the channel is the end of the pull,
 * said in the picture, and the seat that is not pulling reads the fill as the
 * gauge the ring's dial used to be.
 *
 * The spine is any polyline: THE WARDEN's is straight, THE MAZE's bends
 * round the drum. `origin` is where along it the hand takes hold — the start
 * for a rope, the middle for a lever that goes either way — and `at` is where
 * the hand is now; chevrons run from the hand to whichever end is still to
 * come, and stop once there is nothing left to pull.
 */

export interface PullTrack {
  /** From one end of the travel to the other, in field pixels. */
  readonly pts: readonly Point[];
  /** The channel's half-width. */
  readonly w: number;
}

export interface PullTrackDraw {
  /** The control's own colour, and its lit rim. */
  readonly hex: string;
  readonly rim: string;
  readonly held: boolean;
  /** Where the hand takes hold, and where it is now: fractions of the length. */
  readonly origin: number;
  readonly at: number;
  readonly time: number;
}

/** The spine's running length at each point. */
function lengths(pts: readonly Point[]): number[] {
  const out = [0];
  for (let i = 1; i < pts.length; i++) {
    const a = pts[i - 1] as Point;
    const b = pts[i] as Point;
    out.push((out[i - 1] as number) + Math.hypot(b.x - a.x, b.y - a.y));
  }
  return out;
}

/** The point `k` of the way along, and the way the spine is heading there. */
export function pullTrackPoint(
  t: PullTrack,
  k: number,
): { x: number; y: number; dx: number; dy: number } {
  const run = lengths(t.pts);
  const total = run[run.length - 1] ?? 0;
  const want = Math.max(0, Math.min(1, k)) * total;
  let i = 1;
  while (i < t.pts.length - 1 && (run[i] as number) < want) i++;
  const a = t.pts[i - 1] as Point;
  const b = t.pts[i] ?? a;
  const seg = (run[i] as number) - (run[i - 1] as number) || 1;
  const u = (want - (run[i - 1] as number)) / seg;
  const len = Math.hypot(b.x - a.x, b.y - a.y) || 1;
  return {
    x: a.x + (b.x - a.x) * u,
    y: a.y + (b.y - a.y) * u,
    dx: (b.x - a.x) / len,
    dy: (b.y - a.y) / len,
  };
}

/** The piece of the spine between two fractions, as one open path. */
function slice(t: PullTrack, from: number, to: number): Path2D {
  const p = new Path2D();
  const steps = Math.max(1, Math.ceil((to - from) * (t.pts.length - 1)));
  for (let i = 0; i <= steps; i++) {
    const q = pullTrackPoint(t, from + ((to - from) * i) / steps);
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
const CHEVRON_EVERY = 3.4;

/** Chevrons from `from` towards `to`, drifting the way the hand should go. */
function chevrons(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  from: number,
  to: number,
  time: number,
): void {
  const total = lengths(t.pts).at(-1) ?? 0;
  const span = Math.abs(to - from) * total;
  // Closer together on a short run, so a lever's half-channel still says
  // which way; none once there is not room for one.
  const gap = Math.min(t.w * CHEVRON_EVERY, span / 1.5);
  if (span < t.w * 1.5) return;
  const way = to > from ? 1 : -1;
  const drift = ((time * 1.2) % 1) * gap;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = STROKE.outline;
  for (let d = drift; d < span - gap * 0.3; d += gap) {
    if (d < gap * 0.3) continue;
    const q = pullTrackPoint(t, from + (way * d) / total);
    const fx = q.dx * way;
    const fy = q.dy * way;
    const s = t.w * 0.55;
    ctx.globalAlpha = 0.75 * Math.min(1, (span - d) / gap, d / gap);
    const v = new Path2D();
    v.moveTo(q.x - fx * s - fy * s, q.y - fy * s + fx * s);
    v.lineTo(q.x, q.y);
    v.lineTo(q.x - fx * s + fy * s, q.y - fy * s - fx * s);
    ctx.stroke(v);
  }
}

/** The channel, the green behind the hand, and the chevrons ahead of it. */
export function drawPullTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  const whole = slice(t, 0, 1);
  const breathe = o.held ? 1 : 0.8 + 0.2 * Math.sin(o.time * 4);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  stroke(ctx, whole, o.held ? o.rim : o.hex, t.w * 2 + STROKE.inner * 4, 0.18 * breathe);
  stroke(ctx, whole, o.held ? o.rim : o.hex, t.w * 2 + STROKE.inner * 2, 0.85 * breathe);
  stroke(ctx, whole, PALETTE.background, t.w * 2, 1);
  stroke(ctx, whole, o.hex, t.w * 2, o.held ? 0.3 : 0.16);
  const lo = Math.min(o.origin, o.at);
  const hi = Math.max(o.origin, o.at);
  if (hi - lo > 0.001) stroke(ctx, slice(t, lo, hi), PALETTE.good, t.w * 1.5, 0.9);
  // Ahead of the hand: to the far end of the way it is going, or both ends
  // while it has not gone either way yet.
  if (o.at > o.origin || o.origin <= 0) chevrons(ctx, t, o.at, 1, o.time);
  else if (o.at < o.origin || o.origin >= 1) chevrons(ctx, t, o.at, 0, o.time);
  else {
    chevrons(ctx, t, o.at, 1, o.time);
    chevrons(ctx, t, o.at, 0, o.time);
  }
  ctx.restore();
}
