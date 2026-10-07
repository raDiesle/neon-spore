import type { SimConfig } from "./config.js";
import type { GimbalState } from "./gimbal.js";
import { gimbalBoss, gimbalLeaking } from "./gimbal.js";
import { sparkFallMilli, sparkFuseTicks, sparkMeets } from "./spark-fall.js";
import type { World } from "./world.js";

/**
 * **Where THE GIMBAL's leak is**, in the field's own thousandths of a row:
 * the bead of light run from the drum's middle down the seam's column toward
 * the hull over `gimbalSeamBeats`, eased in and out — and a bolt meets it
 * *there*, on the tick it reaches it, rather than when it leaves the top of
 * the field. The owner, 5 October 2026: the shot should hit it and *take
 * effect immediately it hit the right location*; judged at the top, the seam
 * shut and the rig shook a quarter of a beat after the bolt was drawn
 * bursting on the bead (`render/bolt-stop.ts`).
 *
 * The picture lays the bead off this too (`render/gimbal-drum.ts`), so the
 * two cannot drift apart. The fall is every spark's (`spark-fall.ts`).
 */

/** The drum's middle, where the bead starts: a row and a tenth down the field. */
export const GIMBAL_ROW_MILLI = 3100;
/** The bead's half-height, thousandths of a row. */
export const GIMBAL_BEAD_MILLI = 260;
/**
 * The bead's centre after `fuseTicks` of the leak (a fraction of a tick is
 * the picture's, between two): from the drum's middle to the hull's top edge.
 */
export function gimbalBeadMilli(cfg: SimConfig, fuseTicks: number): number {
  return sparkFallMilli(cfg, GIMBAL_ROW_MILLI, cfg.gimbalSeamBeats, fuseTicks);
}

/** The bead's centre on this tick, or `back` ticks before it. */
export function gimbalBeadNowMilli(world: World, s: GimbalState, back = 0): number {
  return Math.floor(
    gimbalBeadMilli(world.cfg, sparkFuseTicks(world, s.seamBeat, world.tick) - back),
  );
}

/**
 * Where a bolt sweeping from `from` to `to` meets the bead, or -1 with none
 * leaking — once `boss-along.ts` has asked `gimbalVerdict` that the bolt is in
 * its column. The beam ends on it as a bolt does.
 */
export function gimbalBeadAlong(world: World, from: number, to: number): number {
  const s = gimbalBoss(world);
  if (s === null || !gimbalLeaking(s)) return -1;
  return sparkMeets(gimbalBeadNowMilli(world, s), gimbalBeadNowMilli(world, s, 1), from, to);
}
