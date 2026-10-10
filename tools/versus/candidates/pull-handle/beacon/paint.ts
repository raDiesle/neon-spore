import type { Point } from "../../../../../packages/content/src/index.js";
import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import { type PullKnobDraw, paintPullKnob } from "../../../../../packages/render/src/pull-knob.js";
import {
  PULL_TRACK_W,
  type PullTrack,
  type PullTrackDraw,
  paintPullTrack,
  pullTrackPoint,
} from "../../../../../packages/render/src/pull-track.js";

/**
 * **BEACON** — the pull shows the hand what to do before it is asked to.
 *
 * - **Waiting**, a ghost of the knob slides from where it rests to where the
 *   pull is full, over and over, and a socket waits at the far end: the
 *   whole gesture, played, before a thumb is on it.
 * - **Held**, the socket brightens as the knob nears it, and a ring round the
 *   knob fills clockwise with how far it has come.
 * - **Full**, the socket closes green and throws two rings out.
 *
 * A closed track (a wheel) is a turn, not a pull, and is drawn as it ships.
 */

/** Seconds for one ghost run from rest to the far end. */
const GHOST_RUN = 1.5;
/** Close enough to the end to be the whole way. */
const FULL = 0.985;

/** The ends a pull is going to: the far end, or for a two-way pull still at rest, both. */
export function goals(origin: number, at: number): (0 | 1)[] {
  if (origin <= 0) return [1];
  if (origin >= 1) return [0];
  if (at > origin + 0.01) return [1];
  if (at < origin - 0.01) return [0];
  return [0, 1];
}

/** How much of the way to `goal` the hand has come, 0..1. */
export function share(origin: number, at: number, goal: 0 | 1): number {
  const span = Math.abs(goal - origin) || 1;
  return Math.max(0, Math.min(1, ((at - origin) * (goal - origin > 0 ? 1 : -1)) / span));
}

const ring = (ctx: CanvasRenderingContext2D, at: Point, r: number): void => {
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
};

function socket(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  p: number,
  o: PullTrackDraw,
): void {
  const full = p >= FULL;
  ctx.save();
  if (full) {
    // Two rings thrown out of the socket and eight rays, on the clock so a held frame shows them.
    for (const lag of [0, 0.5]) {
      const u = (o.time * 1.6 + lag) % 1;
      ctx.strokeStyle = PALETTE.good;
      ctx.lineWidth = STROKE.outline * 2.2 * (1 - u);
      ctx.globalAlpha = 0.95 * (1 - u);
      ring(ctx, at, r * (1.2 + 2.2 * u));
      ctx.stroke();
    }
    const u = (o.time * 1.6) % 1;
    ctx.strokeStyle = PALETTE.goodRim;
    ctx.lineWidth = STROKE.outline * 1.4;
    ctx.lineCap = "round";
    ctx.globalAlpha = 1 - u;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
      const d0 = r * (1.5 + 1.2 * u);
      ctx.beginPath();
      ctx.moveTo(at.x + Math.cos(a) * d0, at.y + Math.sin(a) * d0);
      ctx.lineTo(at.x + Math.cos(a) * (d0 + r * 0.7), at.y + Math.sin(a) * (d0 + r * 0.7));
      ctx.stroke();
    }
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = PALETTE.good;
    ring(ctx, at, r * 1.15);
    ctx.fill();
    ctx.restore();
    return;
  }
  // The socket: a ring of ticks turning slowly, brighter the nearer the knob.
  const ticks = 12;
  ctx.strokeStyle = p > 0 ? o.rim : o.hex;
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.35 + 0.65 * p;
  for (let i = 0; i < ticks; i++) {
    const a = (i / ticks) * Math.PI * 2 + o.time * 0.8;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r * 1.12, a, a + (Math.PI * 2) / ticks / 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.12 + 0.25 * p;
  ctx.fillStyle = o.hex;
  ring(ctx, at, r * 0.95);
  ctx.fill();
  ctx.restore();
}

function ghost(ctx: CanvasRenderingContext2D, t: PullTrack, r: number, o: PullTrackDraw): void {
  for (const goal of goals(o.origin, o.at)) {
    const u = (o.time / GHOST_RUN) % 1;
    const k = o.origin + (goal - o.origin) * smoothstep(u);
    const q = pullTrackPoint(t, k);
    ctx.save();
    ctx.globalAlpha = 0.45 * Math.sin(u * Math.PI);
    ctx.strokeStyle = o.rim;
    ctx.lineWidth = STROKE.outline;
    ring(ctx, q, r * 0.85);
    ctx.stroke();
    ctx.globalAlpha *= 0.4;
    ctx.fillStyle = o.hex;
    ctx.fill();
    ctx.restore();
  }
}

/** The ring round the knob: how far it has come, clockwise from twelve. */
function progressRing(ctx: CanvasRenderingContext2D, at: Point, r: number, p: number): void {
  if (p <= 0.01) return;
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.background;
  ctx.lineWidth = STROKE.outline * 2.6;
  ring(ctx, at, r * 1.38);
  ctx.globalAlpha = 0.7;
  ctx.stroke();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 1.38, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}

export function beaconTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  if (t.closed) {
    paintPullTrack(ctx, t, o);
    return;
  }
  const r = t.w / PULL_TRACK_W;
  paintPullTrack(ctx, t, o);
  let p = 0;
  for (const goal of goals(o.origin, o.at)) {
    const g = share(o.origin, o.at, goal);
    p = Math.max(p, g);
    socket(ctx, pullTrackPoint(t, goal), r, g, o);
  }
  if (!o.held && p < 0.01) ghost(ctx, t, r, o);
  if (o.held) progressRing(ctx, pullTrackPoint(t, o.at), r, p);
}

export function beaconKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
): void {
  paintPullKnob(ctx, at, r, o);
  if (o.theirs || o.held) return;
  // A brighter heartbeat than the shipped breath: two quick beats, then rest.
  const u = (o.time * 1.2) % 1;
  const beat = Math.max(0, Math.sin(u * Math.PI * 4)) * (u < 0.5 ? 1 : 0);
  ctx.save();
  ctx.strokeStyle = o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.globalAlpha = 0.6 * beat;
  ring(ctx, at, r * (1.3 + 0.35 * beat));
  ctx.stroke();
  ctx.restore();
}
