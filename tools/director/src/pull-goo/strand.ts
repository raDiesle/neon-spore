import type { Point } from "@neon-spore/content";
import { PALETTE, type PullTrack, pullTrackPoint } from "@neon-spore/render";
import { lengthOf } from "./beat.js";
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

/** The outline either side of a run, `half(u, s)` wide at `u`, `s` pixels along it,
 * closed round the back of its start by a lumpy half-round as wide as it is there —
 * never cut straight across. Sampled closer within `dense` pixels of the start, where a
 * splash bulges. */
function outline(
  run: Run,
  from: number,
  to: number,
  half: (u: number, s: number) => number,
  dense = 0,
) {
  const n = 32;
  const a = pullTrackPoint(run.t, run.origin);
  const b = pullTrackPoint(run.t, run.at);
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  const us: number[] = [];
  for (let i = 0; i <= n; i++) us.push(from + ((to - from) * i) / n);
  const near = len > 0 ? Math.min(to - from, dense / len) : 0;
  for (let i = 1; i < 16 && near > 0; i++) us.push(from + (near * i) / 16);
  us.sort((x, y) => x - y);
  const left: Point[] = [];
  const right: Point[] = [];
  for (const u of us) {
    const q = runPoint(run, u);
    const h = half(u, (u - from) * len);
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
  // Round the back, away from the drop: right side to left through the point behind.
  const q0 = runPoint(run, from);
  const h0 = half(from, 0);
  const back = run.at >= run.origin ? -1 : 1;
  for (let i = 1; i < 16; i++) {
    const th = (i / 16) * Math.PI;
    const k = h0 * (1 + 0.35 * Math.sin(th) * fbm(th * 0.9 + run.origin * 9, 5));
    const across = Math.cos(th) * k;
    const behind = Math.sin(th) * k * back * FLAT;
    p.lineTo(q0.x + q0.dy * across + q0.dx * behind, q0.y - q0.dx * across + q0.dy * behind);
  }
  p.closePath();
  return p;
}

/** The splash left where the drop was taken, in radii: how wide the puddle is either side
 * of the start, and how far it is drawn out after the drop, like rubber, before it is
 * only tail. The owner, 11 October 2026: *leave a small slime area … in the middle of
 * starting of button … like a small splash … pulled a little bit like a rubber to the
 * direction of button pull location* — in place of the tail's flat foot. */
const SPLASH = 0.3;
const STRETCH = 0.9;
/** How far the back of a start reaches behind it, as a share of its width: a puddle,
 * wider than it is deep. */
const FLAT = 0.7;

/** How much the splash adds to a tail's half-width `s` pixels from the start: all of it
 * at the start, narrowing like a pulled neck, none past `STRETCH`. */
export function splashAt(s: number, r: number, len: number): number {
  const reach = Math.min(r * STRETCH, len * 0.6);
  if (reach <= 0 || s >= reach) return 0;
  return r * SPLASH * 0.5 * (1 + Math.cos((Math.PI * s) / reach));
}

/** The tail: the splash at the start, a thin uneven waist, a neck swelling into the drop.
 * `taut` thins it, as a pull at full stretch or a sling about to let go does; a tail
 * whose start is not where the drop was taken (`splash` false) ends in a round tip. */
export function tailPath(run: Run, r: number, time: number, taut = 0, splash = true): Path2D {
  const len = runLength(run);
  return outline(
    run,
    0,
    1,
    (u, s) => {
      const neck = 0.62 * u ** 4;
      const lumpy = 1 + 0.45 * fbm(s / (r * 1.4) + time * 0.35, 3);
      const tail = r * (0.08 + neck) * lumpy * (1 - 0.45 * taut);
      return tail + (splash ? splashAt(s, r, len) : 0);
    },
    r * STRETCH,
  );
}

/** The splash alone, left at the start once the tail has gone: the puddle, drawn out to a
 * point the way the drop went. */
export function splashPath(run: Run, r: number): Path2D {
  const len = runLength(run);
  const reach = Math.min(r * STRETCH, len * 0.6);
  return outline(run, 0, len > 0 ? reach / len : 0, (_u, s) => splashAt(s, r, len), reach);
}

/** Where the tail turns from the drop's colour to green: the drop's own colour out to
 * its `rim`, green by `span` pixels back from its middle. */
export interface Blend {
  readonly run: Run;
  readonly color: string;
  readonly rim: number;
  readonly span: number;
}

/**
 * The tail, filled and edged in `color` — the count's green while it is
 * pulled, the refusal's red when it fails: one tail and no smear under it,
 * the owner, 10 October 2026: *remaining tail should only be in green colour
 * and a single one, not both*. `red` washes it towards red as the drop nears
 * the edge of the path. With `blend` it leaves the drop in the drop's own
 * colour and is green a short way on — the owner, the same day: *make tail
 * at the beginning on ball to fast transition colour … from the colour of
 * ball to the green*, so the goo reads as coming out of the drop.
 */
export function paintTail(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  color: string,
  red: number,
  alpha: number,
  blend?: Blend,
): void {
  const fill = mix(color, PALETTE.red, red);
  const edge = mix(mix(color, "#FFFFFF", 0.3), PALETTE.red, red);
  const paint = (c: string, white: number): string | CanvasGradient => {
    if (!blend) return c;
    const len = runLength(blend.run) || 1;
    const a = runPoint(blend.run, 1);
    const b = runPoint(blend.run, Math.max(0, 1 - blend.span / len));
    const g = ctx.createLinearGradient(a.x, a.y, b.x, b.y);
    const own = mix(mix(blend.color, "#FFFFFF", white), PALETTE.red, red);
    // The drop's own colour as far as its rim, then green within the span.
    g.addColorStop(0, own);
    g.addColorStop(Math.min(0.9, blend.rim / blend.span), own);
    g.addColorStop(1, c);
    return g;
  };
  ctx.save();
  ctx.fillStyle = paint(fill, 0);
  ctx.globalAlpha = 0.55 * alpha;
  ctx.fill(p);
  ctx.strokeStyle = paint(edge, 0.3);
  ctx.globalAlpha = 0.75 * alpha;
  ctx.lineWidth = 0.8;
  ctx.stroke(p);
  ctx.restore();
}

/** How long a run is on the screen, start to drop, as the crow flies. */
function runLength(run: Run): number {
  const a = runPoint(run, 0);
  const b = runPoint(run, 1);
  return Math.hypot(b.x - a.x, b.y - a.y);
}

/**
 * Small green specks either side of the way the drop came, each where it
 * fell — placed by the distance along the path from the start and off the
 * path itself, never off the drop, so once dropped they do not move: not as
 * the pull goes on, and not as the hand swings the drop from side to side
 * (the owner, 10 October 2026: *the tail dot once drawn must not move*).
 * Quiet: never brighter than the drop's own rim.
 */
export function specks(ctx: CanvasRenderingContext2D, run: Run, r: number, alpha: number): void {
  if (alpha <= 0 || Math.abs(run.at - run.origin) < 0.005) return;
  const len = lengthOf(run.t) || 1;
  const came = Math.abs(run.at - run.origin) * len;
  const sign = run.at > run.origin ? 1 : -1;
  const gap = r * 0.75;
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  for (let i = 0; ; i++) {
    const along = (i + hash(i * 1.7)) * gap;
    if (along > came - r) break;
    const q = pullTrackPoint(run.t, run.origin + (sign * along) / len);
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
