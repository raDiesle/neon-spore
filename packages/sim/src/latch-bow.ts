import type { SimConfig } from "./config.js";
import type { LatchGrip } from "./latch.js";
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
 * **THE LATCH's grips bow**: each one's stroke down is a half-wave out
 * **away from the tendril** and back, `latchBowMilli` at its widest halfway
 * down `latchReachMilli` — the owner, 13 October 2026, choosing which pulls
 * bend: *every straight pull with room*, this one last (`pull-path.ts`).
 *
 * The left grip bows left and the right one right, so the two hands
 * splay off the one rope rather than crossing it; the grips hang a column
 * either side of the middle, so there is always room. The depth is still
 * the straight distance down, which is what hauls the tendril, and a thumb
 * a tile across from the bow drops the grip until it lifts
 * (`latch-hand.ts`) — the depth pull down a bow THE SINEW's handles share
 * (`pull-down-bow.ts`).
 */
function latchBow(cfg: SimConfig, grip: LatchGrip): DownBow {
  return {
    side: grip === 0 ? -1 : 1,
    reachMilli: cfg.latchReachMilli,
    bowMilli: cfg.latchBowMilli,
  };
}

/** `grip`'s path from its rest, in thousandths of a tile from there. */
export function latchBowPath(cfg: SimConfig, grip: LatchGrip): PullPath {
  return downBowPath(latchBow(cfg, grip));
}

/** Where `grip`'s knob stands from its rest, pulled `depth` thousandths straight down. */
export function latchBowPoint(
  cfg: SimConfig,
  grip: LatchGrip,
  depth: number,
): { x: number; y: number } {
  return downBowPoint(latchBow(cfg, grip), depth);
}

/** Whether a hand `x` across and `y` down from where it took hold is off `grip`'s bow. */
export function latchStrays(cfg: SimConfig, grip: LatchGrip, x: number, y: number): boolean {
  return downBowStrays(latchBow(cfg, grip), x, y);
}

/** How much of the bow's own length a knob `depth` down has come, 0..1 (`render/latch-handles.ts`). */
export function latchBowShare(cfg: SimConfig, grip: LatchGrip, depth: number): number {
  return downBowShare(latchBow(cfg, grip), depth);
}

/** Where a hand that took hold at nought stands with `grip` `depth` down, on the bow. */
export function latchBowFromMilli(
  cfg: SimConfig,
  grip: LatchGrip,
  depth: number,
): { fromMilli: number; fromYMilli: number } {
  return downBowFromMilli(latchBow(cfg, grip), depth);
}
