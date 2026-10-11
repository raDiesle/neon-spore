import type { Point } from "@neon-spore/content";
import type { PullTrack } from "./pull-track.js";

/**
 * **Where a path's dots sit and when they light** — how many, how far short
 * of the place they stop, and the beat of the ghost, the flash and the blink
 * that run along them and on into the place (`goo-parts.ts` draws them).
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

/** Seconds from one waiting run of the dots to the next, and the share of it the ghost
 * takes to run the whole way; the front it lights runs on past the end at the same pace,
 * through the place's beat and a rest. Quicker than OOZE's (`GHOST_RUN`, 1.6 s, 0.72 of
 * it) — the owner, 11 October 2026: *increase animation movement timing speed of
 * lightning dots so its faster to go the path to the placeholder*. */
const RUN = 1.1;
const GHOST_TRAVEL = 0.5;

/** How far the waiting ghost's front has run, as a share of the way, at one steady pace
 * — the owner, 11 October 2026: *I expect it follows same speed as the dots*. So every
 * dot lights one beat after the one before, and so does the place after the last (past
 * 1 once the ghost is in it, for the place's flash to fade and the rest before the next
 * run). */
export function ghostFront(time: number): number {
  return ((time / RUN) % 1) / GHOST_TRAVEL;
}

/** How lit a mark at `along` is once the front has passed it: at once, then fading over
 * a third of the way. */
export function passed(front: number, along: number): number {
  return front < along ? 0 : Math.max(0, 1 - (front - along) * 3.2);
}

/** Where the place sits in the dots' beat: one dot's spacing after the last, so it is
 * the next thing to light, with no pause before it. */
export function placeBeat(t: PullTrack, r: number): number {
  const n = dotCount(t, r);
  return Math.min(1, (dotsEnd(t, r) * (n + 1)) / n);
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
