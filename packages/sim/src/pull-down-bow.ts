import {
  PULL_STRAY_MILLI,
  type PullPath,
  pullBowAt,
  pullBowPath,
  pullPathLength,
  pullPathNearest,
} from "./pull-path.js";

/**
 * **A depth pull down a bow**: a handle carried down to a depth and held
 * there, its way bowed to one side — THE SINEW's two handles and THE LATCH's
 * two grips, each pair splaying apart (`sinew-bow.ts`, `latch-bow.ts`).
 *
 * - **The depth is the straight distance down**, as it was before the bow,
 *   so everything that reads it — a sum, a haul, a film — reads the same
 *   units; the knob stands on the bow at that depth (`pullBowAt`).
 * - **A thumb further across than `PULL_STRAY_MILLI` from the bow at its
 *   depth is off it** — measured across, not to the nearest point, so a
 *   thumb carried on past the reach is still on its handle, as it always
 *   was, rather than off the end.
 */
export interface DownBow {
  /** Which way it bows: `-1` left, `1` right. */
  side: -1 | 1;
  /** How far down it reaches, thousandths of a tile. */
  reachMilli: number;
  /** How far across it bows at its widest, halfway down. */
  bowMilli: number;
}

/** The path from the rest, in thousandths of a tile from there. */
export function downBowPath(b: DownBow): PullPath {
  return pullBowPath({ dx: 0, dy: 1 }, { dx: b.side, dy: 0 }, b.reachMilli, b.bowMilli);
}

/** Where the knob stands from its rest, pulled `depth` thousandths straight down. */
export function downBowPoint(b: DownBow, depth: number): { x: number; y: number } {
  return pullBowAt({ dx: 0, dy: 1 }, { dx: b.side, dy: 0 }, b.reachMilli, b.bowMilli, depth);
}

/** Whether a hand `x` across and `y` down from where it took hold is off the bow. */
export function downBowStrays(b: DownBow, x: number, y: number): boolean {
  const depth = Math.max(0, Math.min(b.reachMilli, y));
  return Math.abs(x - downBowPoint(b, depth).x) > PULL_STRAY_MILLI;
}

/**
 * How much of the bow's own length a knob `depth` down has come, 0..1: what
 * its channel fills to, which the straight depth would leave short mid-bow.
 */
export function downBowShare(b: DownBow, depth: number): number {
  const path = downBowPath(b);
  const len = pullPathLength(path);
  if (len <= 0 || b.reachMilli <= 0) return 0;
  const at = downBowPoint(b, depth);
  const from = Math.trunc((depth * len) / b.reachMilli);
  return pullPathNearest(path, from, at.x, at.y).alongMilli / len;
}

/**
 * Where a hand that took hold at nought stands with the knob `depth` down:
 * on the bow, which a film, the autopilot and a director pose send so they
 * follow the channel (`scene-aim-bow.ts`, `hands/`).
 */
export function downBowFromMilli(
  b: DownBow,
  depth: number,
): { fromMilli: number; fromYMilli: number } {
  return { fromMilli: downBowPoint(b, depth).x, fromYMilli: depth };
}
