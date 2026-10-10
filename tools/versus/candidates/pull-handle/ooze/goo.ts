import type { Point } from "../../../../../packages/content/src/index.js";
import {
  type PullTrack,
  type PullTrackDraw,
  pullTrackPoint,
} from "../../../../../packages/render/src/pull-track.js";

/**
 * What OOZE's channel and knob both need: which end the pull goes to, how far
 * it has come, where the drop really is (off the path when the hand took it
 * there), the wobbling contour every drop in it is drawn with, and the one
 * clock a counted pull's pop runs on.
 */

/** Close enough to the end to be the whole way. */
export const FULL = 0.985;
/** Seconds for one ghost run from rest to the far end; the runway lights with it. */
export const GHOST_RUN = 1.6;
/** Seconds the drop takes to pop once counted; after it, no drop is drawn. */
export const POP = 0.38;
/** Seconds a refusal's red burst lasts round the drop. */
export const REFUSE_BURST = 0.55;

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

/** Where the drop is drawn: on the path at `at`, or where the hand has it off it. */
export function dropAt(t: PullTrack, o: PullTrackDraw): Point {
  const q = pullTrackPoint(t, o.at);
  const off = o.after?.off ?? { x: 0, y: 0 };
  return { x: q.x + off.x, y: q.y + off.y };
}

/**
 * Seconds since the pull was counted, on one clock across the lift — the
 * lab restarts `since` when a counted pull is let go, and the pop must not
 * play twice. `null` when the pull is not counted.
 */
export function countedFor(after: PullTrackDraw["after"], held: boolean): number | null {
  if (after?.verdict !== "counted") return null;
  return held ? after.since : POP * 2 + after.since;
}

/** How much a drop's rim swells at angle `a`: three slow lobes and two quicker. */
export function wobble(a: number, time: number): number {
  return 1 + 0.07 * Math.sin(a * 3 + time * 5) + 0.04 * Math.sin(a * 2 - time * 3);
}

/** A drop round `at`: a circle whose rim wobbles, pushed out on the side it leans to. */
export function blob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  time: number,
  lean: Point = { x: 0, y: 0 },
  amt = 0,
): void {
  ctx.beginPath();
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const push = 1 + amt * Math.max(0, ca * lean.x + sa * lean.y);
    const d = r * wobble(a, time) * push;
    if (i === 0) ctx.moveTo(at.x + ca * d, at.y + sa * d);
    else ctx.lineTo(at.x + ca * d, at.y + sa * d);
  }
  ctx.closePath();
}

/** The drop's own rim, from twelve o'clock clockwise for `p` of the way round, at `r`. */
export function rimArc(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  time: number,
  p: number,
): void {
  ctx.beginPath();
  const n = Math.max(2, Math.ceil(40 * p));
  for (let i = 0; i <= n; i++) {
    const a = -Math.PI / 2 + (i / n) * p * Math.PI * 2;
    const d = r * wobble(a, time);
    if (i === 0) ctx.moveTo(at.x + Math.cos(a) * d, at.y + Math.sin(a) * d);
    else ctx.lineTo(at.x + Math.cos(a) * d, at.y + Math.sin(a) * d);
  }
}

export const dot = (ctx: CanvasRenderingContext2D, at: Point, r: number): void => {
  ctx.beginPath();
  ctx.arc(at.x, at.y, Math.max(0, r), 0, Math.PI * 2);
  ctx.fill();
};
