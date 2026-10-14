import type { SimConfig } from "./config.js";
import {
  PULL_STRAY_MILLI,
  type PullPath,
  pullBowAt,
  pullBowPath,
  pullPathLength,
  pullPathNearest,
} from "./pull-path.js";

/**
 * **THE SINEW's handles bow**: each one's way down is no longer a straight
 * line but a half-wave out **away from the mass** and back, `sinewBowMilli`
 * at its widest halfway down `sinewReachMilli` — the owner, 13 October 2026,
 * choosing which pulls bend: *every straight pull with room*, this one third
 * (`pull-path.ts`, `warden-bow.ts`, `lid-bow.ts`).
 *
 * - **Away from the mass**: the pilot's left handle bows left and the
 *   navigator's right one right, so the two splay apart and neither crosses
 *   under the body. There is always room: the mass hangs over the middle
 *   column for as long as a depth is read, and walks only in the fall, when
 *   the bow is not asked (`sinew-step.ts`).
 * - **The depth is still the straight distance down**, as it was: the zone,
 *   the sum and every film read it in the same units, and the handle stands
 *   on the bow at that depth (`pullBowAt`).
 * - **A thumb further across than `PULL_STRAY_MILLI` from the bow at its
 *   depth drops the handle** until it lifts (`sinew-hand.ts`) — measured
 *   across, not to the nearest point, so a thumb carried on past the reach
 *   is still on its handle, as it always was, rather than off the end.
 */

/** Which way `player`'s handle bows: away from the mass, so the two splay. */
export function sinewBowSide(player: 1 | 2): -1 | 1 {
  return player === 1 ? -1 : 1;
}

/** `player`'s handle's path from its rest, in thousandths of a tile from there. */
export function sinewBowPath(cfg: SimConfig, player: 1 | 2): PullPath {
  const side = { dx: sinewBowSide(player), dy: 0 };
  return pullBowPath({ dx: 0, dy: 1 }, side, cfg.sinewReachMilli, cfg.sinewBowMilli);
}

/** Where `player`'s handle stands from its rest, pulled `depth` thousandths straight down. */
export function sinewBowPoint(
  cfg: SimConfig,
  player: 1 | 2,
  depth: number,
): { x: number; y: number } {
  const side = { dx: sinewBowSide(player), dy: 0 };
  return pullBowAt({ dx: 0, dy: 1 }, side, cfg.sinewReachMilli, cfg.sinewBowMilli, depth);
}

/** Whether a hand `x` across and `y` down from where it took hold is off its handle's bow. */
export function sinewStrays(cfg: SimConfig, player: 1 | 2, x: number, y: number): boolean {
  const depth = Math.max(0, Math.min(cfg.sinewReachMilli, y));
  return Math.abs(x - sinewBowPoint(cfg, player, depth).x) > PULL_STRAY_MILLI;
}

/**
 * How much of the bow's own length a handle `depth` down has come, 0..1:
 * what its channel fills to (`render/sinew-marks.ts`), which the straight
 * depth would leave short of the knob mid-bow.
 */
export function sinewBowShare(cfg: SimConfig, player: 1 | 2, depth: number): number {
  const path = sinewBowPath(cfg, player);
  const len = pullPathLength(path);
  if (len <= 0 || cfg.sinewReachMilli <= 0) return 0;
  const at = sinewBowPoint(cfg, player, depth);
  const from = Math.trunc((depth * len) / cfg.sinewReachMilli);
  return pullPathNearest(path, from, at.x, at.y).alongMilli / len;
}

/**
 * Where a hand that took hold at nought stands with its handle `depth` down:
 * on the bow, which a film, the autopilot and a director pose send so they
 * follow the channel (`scene-aim.ts`, `hands/`).
 */
export function sinewBowFromMilli(
  cfg: SimConfig,
  player: 1 | 2,
  depth: number,
): { fromMilli: number; fromYMilli: number } {
  return { fromMilli: sinewBowPoint(cfg, player, depth).x, fromYMilli: depth };
}
