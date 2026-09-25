import type { Point } from "@neon-spore/content";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A pull is drawn as the way the hand goes, and a big circle where it
 * starts.** The one look every handle you pull wears — the owner's rule,
 * written for every boss and every wave in `.claude/skills/new-boss/owner.md`
 * and `.claude/skills/new-creature/SKILL.md`.
 *
 * THE INSTAR's swipe learnt it first (`instar-track.ts`): *instead of a circle
 * for swiping in a direction it should be visual like … a slider*. On 25
 * September 2026 the owner asked the same of the handles you pull, and then
 * refined it the same morning, generic:
 *
 * - **The channel is quiet and thin** — it says where the pull can go, it is
 *   not the control. It runs the whole of the travel, from where the hand
 *   takes hold to where the pull is full, and fills **green** behind the hand.
 * - **The circle to start is big and loud** (`drawPullKnob`, `pull-knob.ts`): it is the one
 *   thing to put a thumb on, it breathes until it is taken, and it is the
 *   handle's radius, never shrunk to the channel's width.
 * - **A press is answered well outside that circle** (`PULL_GRAB`), because a
 *   handle that is also moving is hard to catch.
 * - **A turn goes the whole way round** (`closed`): THE MAZE's wheel turns
 *   without end, so its channel is a closed ring round the drum, hugging it,
 *   and the fill wraps.
 *
 * The spine is any polyline: THE WARDEN's is straight, THE MAZE's is a
 * circle. `origin` is where along it the hand takes hold and `at` is where the
 * hand is now; on an open track both are fractions in [0, 1], on a closed one
 * `at` may run past either end, a whole number of laps being a full ring.
 */

export interface PullTrack {
  /** From one end of the travel to the other, in field pixels. A closed one repeats its first point last. */
  readonly pts: readonly Point[];
  /** The channel's half-width. */
  readonly w: number;
  /** A loop with no ends: the fill wraps, and chevrons run a stretch rather than to an end. */
  readonly closed?: boolean;
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

/** The channel's half-width, as a share of the knob's radius: thin, so the knob is the control. */
export const PULL_TRACK_W = 0.28;

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
  const lap = t.closed ? k - Math.floor(k) : Math.max(0, Math.min(1, k));
  const want = lap * total;
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
  const total = lengths(t.pts).at(-1) ?? 0;
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

/** The channel, the green behind the hand, and the chevrons ahead of it. */
export function drawPullTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
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
