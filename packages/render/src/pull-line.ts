import type { Point } from "@neon-spore/content";
import { handleBoundsMilli, type SimConfig } from "@neon-spore/sim";
import type { Layout } from "./layout.js";
import { PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **A pull measured as a distance, as a straight channel** — the track
 * builder THE WARDEN's rope, THE LID's cord, THE STARE's lid and THE
 * CURTAIN's hem share, so the four draw one rule rather than four
 * (`pull-track.ts` draws what this returns).
 *
 * The channel starts where the hand takes hold and is the pull's full length
 * long. While nobody has it, it lies the way it rests (`rest`); once a hand is
 * on it and has gone a handle's width, it turns to the way that hand is
 * actually going — the fill has to be the pull, whichever way it was made.
 * A handle that only goes one way (a lid pulled down, a hem lifted up) passes
 * `follow: false` and the channel stays put.
 */

/** A direction, as a unit vector in field pixels. */
export interface PullWay {
  readonly dx: number;
  readonly dy: number;
}

export const PULL_DOWN: PullWay = { dx: 0, dy: 1 };
export const PULL_UP: PullWay = { dx: 0, dy: -1 };

/** How far the hand goes, in handle radii, before the channel turns to follow it. */
const FOLLOW_AFTER = 2;

export interface StraightPull {
  /** Where the hand takes hold, and the knob's radius there. */
  readonly from: Point;
  readonly r: number;
  /** Where the knob is now. */
  readonly head: Point;
  readonly held: boolean;
  /** The way the channel lies while nobody has it. */
  readonly rest: PullWay;
  /** The whole of the travel, in pixels. */
  readonly len: number;
  /** Turn to the hand's own way once it has one; true unless said otherwise. */
  readonly follow?: boolean;
}

export function straightPullTrack(p: StraightPull): PullTrack {
  let { dx, dy } = p.rest;
  const hx = p.head.x - p.from.x;
  const hy = p.head.y - p.from.y;
  const went = Math.hypot(hx, hy);
  if (p.follow !== false && p.held && went > 0) {
    const k = Math.min(1, went / (p.r * FOLLOW_AFTER));
    dx = dx * (1 - k) + (hx / went) * k;
    dy = dy * (1 - k) + (hy / went) * k;
    const n = Math.hypot(dx, dy) || 1;
    dx /= n;
    dy /= n;
  }
  return {
    pts: [
      { x: p.from.x, y: p.from.y },
      { x: p.from.x + dx * p.len, y: p.from.y + dy * p.len },
    ],
    w: p.r * PULL_TRACK_W,
  };
}

/**
 * How far a handle at `from` can go along `w` before its circle meets the
 * field's edge or the app's chrome — `sim/handle-pull.ts`'s own bounds,
 * called rather than re-derived, in pixels.
 */
export function pullRoom(l: Layout, cfg: SimConfig, from: Point, w: PullWay): number {
  const b = handleBoundsMilli(cfg);
  const px = (m: number) => (m * l.tile) / 1000;
  const x0 = l.gridLeft + px(b.x0);
  const x1 = l.gridLeft + px(b.x1);
  const y0 = l.gridTop + px(b.y0);
  const y1 = l.gridTop + px(b.y1);
  let room = Number.POSITIVE_INFINITY;
  if (w.dx > 0) room = Math.min(room, (x1 - from.x) / w.dx);
  if (w.dx < 0) room = Math.min(room, (x0 - from.x) / w.dx);
  if (w.dy > 0) room = Math.min(room, (y1 - from.y) / w.dy);
  if (w.dy < 0) room = Math.min(room, (y0 - from.y) / w.dy);
  return Math.max(0, room);
}

/** The first of `ways` the field holds `len` of, straight; else whichever has the most room. */
export function fittingWay(
  l: Layout,
  cfg: SimConfig,
  from: Point,
  len: number,
  ways: readonly PullWay[],
): PullWay {
  let best = ways[0] ?? PULL_DOWN;
  let bestRoom = -1;
  for (const w of ways) {
    const room = pullRoom(l, cfg, from, w);
    if (room >= len) return w;
    if (room > bestRoom) {
      best = w;
      bestRoom = room;
    }
  }
  return best;
}
