import type { SimConfig } from "./config.js";
import {
  type DownBow,
  downBowFromMilli,
  downBowPath,
  downBowPoint,
  downBowShare,
  downBowStrays,
} from "./pull-down-bow.js";
import type { PullPath } from "./pull-path.js";

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
 * - **The depth is still the straight distance down**, and a thumb a tile
 *   across from the bow drops the handle until it lifts (`sinew-hand.ts`):
 *   the depth pull down a bow THE LATCH's grips share (`pull-down-bow.ts`).
 */

/** `player`'s handle's bow: away from the mass, so the two splay. */
function sinewBow(cfg: SimConfig, player: 1 | 2): DownBow {
  return {
    side: player === 1 ? -1 : 1,
    reachMilli: cfg.sinewReachMilli,
    bowMilli: cfg.sinewBowMilli,
  };
}

/** `player`'s handle's path from its rest, in thousandths of a tile from there. */
export function sinewBowPath(cfg: SimConfig, player: 1 | 2): PullPath {
  return downBowPath(sinewBow(cfg, player));
}

/** Where `player`'s handle stands from its rest, pulled `depth` thousandths straight down. */
export function sinewBowPoint(
  cfg: SimConfig,
  player: 1 | 2,
  depth: number,
): { x: number; y: number } {
  return downBowPoint(sinewBow(cfg, player), depth);
}

/** Whether a hand `x` across and `y` down from where it took hold is off its handle's bow. */
export function sinewStrays(cfg: SimConfig, player: 1 | 2, x: number, y: number): boolean {
  return downBowStrays(sinewBow(cfg, player), x, y);
}

/** How much of the bow's own length a handle `depth` down has come, 0..1 (`render/sinew-marks.ts`). */
export function sinewBowShare(cfg: SimConfig, player: 1 | 2, depth: number): number {
  return downBowShare(sinewBow(cfg, player), depth);
}

/** Where a hand that took hold at nought stands with its handle `depth` down, on the bow. */
export function sinewBowFromMilli(
  cfg: SimConfig,
  player: 1 | 2,
  depth: number,
): { fromMilli: number; fromYMilli: number } {
  return downBowFromMilli(sinewBow(cfg, player), depth);
}
