import type { Point } from "@neon-spore/content";
import { type PullTrack, smoothstep } from "@neon-spore/render";
import { GHOST_RUN } from "../../../versus/candidates/pull-handle/ooze/goo.js";

/**
 * **Where a path's dots sit and when they light** — how many, how far short
 * of the place they stop, and the beat of the ghost, the flash and the blink
 * that run along them and on into the place (`parts.ts` draws them).
 */

/** How many dots a path has between its start and its end. */
export function dotCount(t: PullTrack, r: number): number {
  return Math.max(4, Math.round(lengthOf(t) / r)) - 1;
}

/** How far short of the place's centre the last dot stops, in drop radii: outside its
 * dashed rim, swollen or not — the owner, 11 October 2026: *the dotted path should not
 * go into the placeholder, so last dot is outside*. */
const CLEAR = 1.8;

/** The share of the way the last dot sits at; the dots are spread evenly up to it. */
export function dotsEnd(t: PullTrack, r: number): number {
  return Math.max(0.5, 1 - (CLEAR * r) / Math.max(1, lengthOf(t)));
}

/** The share of `GHOST_RUN` the ghost spends running the path; for the rest it has
 * landed and the place blinks, the next thing after the last dot. */
const GHOST_TRAVEL = 0.72;

/** How far along the waiting ghost is, 0..1, and how far into the place's blink, 0..1
 * (0 while it is still running). */
export function ghostPhase(time: number): { at: number; landed: number } {
  const run = (time / GHOST_RUN) % 1;
  return {
    at: smoothstep(Math.min(1, run / GHOST_TRAVEL)),
    landed: Math.max(0, (run - GHOST_TRAVEL) / (1 - GHOST_TRAVEL)),
  };
}

/** One flash, 0..1 over `k` 0..1: quickly up, slowly down, as a dot the ghost passes. */
export function flash(k: number): number {
  return k < 0.2 ? k / 0.2 : 1 - (k - 0.2) / 0.8;
}

/** The blink of whatever is next ahead of a held drop: a dot, then the place. */
export function blinkAt(time: number): number {
  return 0.5 + 0.5 * Math.sin(time * 12);
}

/** How long a track is, in pixels. */
export function lengthOf(t: PullTrack): number {
  let len = 0;
  for (let i = 1; i < t.pts.length; i++) {
    const a = t.pts[i - 1] as Point;
    const b = t.pts[i] as Point;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}
