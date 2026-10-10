import type { Point } from "../../../../../packages/content/src/index.js";
import { noteMark } from "../../../../../packages/render/src/mark-spots.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { PullKnobDraw } from "../../../../../packages/render/src/pull-knob.js";
import {
  PULL_TRACK_W,
  type PullTrack,
  type PullTrackDraw,
  paintPullTrack,
  pullTrackPoint,
} from "../../../../../packages/render/src/pull-track.js";
import { drawWayArrow } from "../../../../../packages/render/src/way-arrow.js";

/**
 * **COMET** — the channel is a runway of lights, and the knob a burning core.
 *
 * - **Waiting**, a wave of light runs down the beads towards the end the pull
 *   is full at, like a landing strip, so the way is said by motion and not
 *   only by the arrow.
 * - **Held**, every bead the knob has passed pops on green, the next one
 *   ahead blinks, and a tail of fire trails the knob along the path.
 * - **Full**, the end star flares and a shockwave rolls out of it.
 *
 * A closed track (a wheel) is a turn, not a pull, and is drawn as it ships.
 */

/** Beads per knob radius of track. */
const BEAD_EVERY = 0.95;
const FULL = 0.985;

function goals(origin: number, at: number): (0 | 1)[] {
  if (origin <= 0) return [1];
  if (origin >= 1) return [0];
  if (at > origin + 0.01) return [1];
  if (at < origin - 0.01) return [0];
  return [0, 1];
}

function lengthOf(t: PullTrack): number {
  let len = 0;
  for (let i = 1; i < t.pts.length; i++) {
    const a = t.pts[i - 1] as Point;
    const b = t.pts[i] as Point;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}

const dot = (ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void => {
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
};

/** A four-pointed star: where the pull is full. */
function star(ctx: CanvasRenderingContext2D, at: Point, r: number, spin: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = spin + (i * Math.PI) / 4;
    const d = i % 2 === 0 ? r : r * 0.38;
    const x = at.x + Math.cos(a) * d;
    const y = at.y + Math.sin(a) * d;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

export function cometTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  if (t.closed) {
    paintPullTrack(ctx, t, o);
    return;
  }
  const r = t.w / PULL_TRACK_W;
  const total = lengthOf(t);
  const n = Math.max(3, Math.round(total / (r * BEAD_EVERY)));
  const lo = Math.min(o.origin, o.at);
  const hi = Math.max(o.origin, o.at);
  const ends = goals(o.origin, o.at);
  ctx.save();
  // A hairline under the beads, so the path still reads as one thing.
  ctx.strokeStyle = o.hex;
  ctx.globalAlpha = 0.18;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (let i = 0; i <= 24; i++) {
    const q = pullTrackPoint(t, i / 24);
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  ctx.stroke();
  for (let i = 0; i <= n; i++) {
    const k = i / n;
    const q = pullTrackPoint(t, k);
    const lit = k >= lo - 1e-6 && k <= hi + 1e-6 && hi - lo > 0.01;
    // The marquee: a crest of light running from the knob to each end.
    let wave = 0;
    for (const g of ends) {
      const along = Math.abs(k - o.origin) / (Math.abs(g - o.origin) || 1);
      const toward = (g - o.origin) * (k - o.origin) >= 0;
      if (!toward) continue;
      const crest = (o.time * 0.9) % 1;
      wave = Math.max(wave, Math.max(0, 1 - Math.abs(along - crest) * 6));
    }
    if (o.held) wave *= 0.3;
    if (lit) {
      ctx.fillStyle = PALETTE.good;
      ctx.globalAlpha = 0.25;
      dot(ctx, q.x, q.y, r * 0.42);
      ctx.globalAlpha = 1;
      dot(ctx, q.x, q.y, r * 0.2);
    } else {
      ctx.fillStyle = wave > 0.05 ? o.rim : o.hex;
      ctx.globalAlpha = 0.35 + 0.65 * wave;
      dot(ctx, q.x, q.y, r * (0.11 + 0.1 * wave));
    }
  }
  if (o.held) tail(ctx, t, o, r);
  for (const g of ends) {
    const p = Math.abs(o.at - o.origin) / (Math.abs(g - o.origin) || 1);
    endStar(ctx, pullTrackPoint(t, g), r, p, o);
  }
  ctx.restore();
}

/** The fire behind the knob: a quarter of the way back along the path, thinning. */
function tail(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw, r: number): void {
  const back = o.at >= o.origin ? -1 : 1;
  const steps = 14;
  for (let i = steps; i >= 1; i--) {
    const k = o.at + (back * 0.22 * i) / steps;
    if ((back < 0 && k < o.origin) || (back > 0 && k > o.origin)) continue;
    const q = pullTrackPoint(t, k);
    const u = 1 - i / steps;
    ctx.fillStyle = i < 4 ? PALETTE.text : PALETTE.pod;
    ctx.globalAlpha = 0.5 * u;
    dot(ctx, q.x, q.y, r * (0.25 + 0.65 * u));
  }
}

function endStar(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  p: number,
  o: PullTrackDraw,
): void {
  const full = p >= FULL;
  ctx.fillStyle = full ? PALETTE.good : o.hex;
  ctx.globalAlpha = full ? 1 : 0.4 + 0.6 * p;
  star(ctx, at, r * (full ? 1.25 : 0.75 + 0.3 * p), o.time * (full ? 2 : 0.6));
  ctx.fill();
  if (!full) return;
  const u = (o.time * 1.4) % 1;
  ctx.strokeStyle = PALETTE.goodRim;
  ctx.lineWidth = STROKE.outline * 2 * (1 - u);
  ctx.globalAlpha = 1 - u;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * (1 + 2.2 * u), 0, Math.PI * 2);
  ctx.stroke();
}

/** The knob as a burning core: a hot centre in the control's colour, a white rim, the arrow. */
export function cometKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
): void {
  noteMark(ctx, at.x, at.y, r);
  ctx.save();
  const flicker = 0.85 + 0.15 * Math.sin(o.time * 23) * Math.sin(o.time * 7);
  const glow = ctx.createRadialGradient(at.x, at.y, r * 0.2, at.x, at.y, r * 1.9);
  glow.addColorStop(0, o.held ? o.rim : o.hex);
  glow.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = glow;
  ctx.globalAlpha = (o.theirs ? 0.3 : 0.55) * flicker;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 1.9, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  if (!o.theirs) {
    ctx.fillStyle = PALETTE.background;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  const core = ctx.createRadialGradient(at.x, at.y - r * 0.3, r * 0.1, at.x, at.y, r);
  core.addColorStop(0, PALETTE.text);
  core.addColorStop(0.45, o.held ? o.rim : o.hex);
  core.addColorStop(1, o.hex);
  ctx.fillStyle = core;
  ctx.globalAlpha = o.theirs ? 0.35 : o.held ? 0.95 : 0.7;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.text;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  if (o.way) {
    ctx.strokeStyle = PALETTE.background;
    ctx.lineWidth = STROKE.outline * 1.4;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawWayArrow(ctx, at.x, at.y, r * 1.1, o.way.dx, o.way.dy, o.time, o.either ? 2 : 1);
  }
  ctx.restore();
}
