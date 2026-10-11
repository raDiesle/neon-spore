import type { Point } from "@neon-spore/content";
import { type PullTrack, pullTrackPoint } from "@neon-spore/render";
import { LAB_TILE } from "./pull-lab-shapes.js";

/**
 * **A thumb off the path, in the PULL LAB** — ignored, as every pull in the
 * game ignores it today, or a failure past a tolerance either side of the
 * path. The owner, 10 October 2026: *maybe every pull should allow for
 * failure with some tolerance to pull away from the required path*, which
 * would make TRACE ALONG A LINE a pull whose path bends (`docs/spec/ideas.md`,
 * A pull along a path). The rule that asks this is `pull-lab-rule.ts`.
 */

/** What a thumb that leaves the path comes to: nothing, or a failure past
 * one tile or half a tile from it. */
export type Stray = "free" | "tile" | "half";

/** The tolerance either side of the path, in tiles; `null` is no limit. */
export const STRAY_TILES: Readonly<Record<Stray, number | null>> = {
  free: null,
  tile: 1,
  half: 0.5,
};

/** A thumb on glass is let wander this many times as far as a mouse: a
 * fingertip covers the path it follows — the owner, 11 October 2026, *on
 * touch devices, the tolerance area for mistake must be increased — around
 * double the size*. */
export const TOUCH_SLACK = 2;

/** The tolerance either side of the path in field pixels, or `null` where
 * there is none; `touch` for a finger. */
export function strayReach(stray: Stray, touch = false): number | null {
  const limit = STRAY_TILES[stray];
  return limit === null ? null : limit * LAB_TILE * (touch ? TOUCH_SLACK : 1);
}

/** The nearest point of the track to `at`, searched near where the knob is
 * so a curve that doubles back is not jumped across, and how far off it the
 * thumb is. */
export function nearest(t: PullTrack, from: number, at: Point): { k: number; off: number } {
  let best = from;
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= 200; i++) {
    const k = i / 200;
    if (Math.abs(k - from) > 0.3) continue;
    const q = pullTrackPoint(t, k);
    const d = Math.hypot(q.x - at.x, q.y - at.y);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return { k: best, off: bestD };
}
