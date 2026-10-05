import { beatPhaseTicks } from "./beat-clock.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import type { GimbalState } from "./gimbal.js";
import { gimbalBoss, gimbalLeaking } from "./gimbal.js";
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
 * two cannot drift apart.
 */

/** The drum's middle, where the bead starts: a row and a tenth down the field. */
export const GIMBAL_ROW_MILLI = 3100;
/** The bead's half-height, thousandths of a row. */
export const GIMBAL_BEAD_MILLI = 260;
/**
 * How far past the bead's centre a bolt is met, thousandths of a row: beyond
 * its far rim, so the picture always has a frame of the bolt bursting on its
 * near one before the bolt is taken off the field — the bead runs down to
 * meet the bolt as it climbs, and the gap closes up to a fifth of a row a tick.
 */
const MEET_MILLI = 500;

/**
 * The bead's centre after `fuseTicks` of the leak (a fraction of a tick is
 * the picture's, between two): from the drum's middle to the hull's top edge.
 */
export function gimbalBeadMilli(cfg: SimConfig, fuseTicks: number): number {
  const total = Math.max(1, cfg.gimbalSeamBeats) * ticksPerBeat(cfg);
  const p = Math.max(0, Math.min(1000, (fuseTicks * 1000) / total));
  const eased = (p * p * (3000 - 2 * p)) / 1e6;
  const end = cfg.rows * 1000 - 1500;
  return GIMBAL_ROW_MILLI + ((end - GIMBAL_ROW_MILLI) * eased) / 1000;
}

/** How many ticks the leak has run on `tick`, off the beat it opened on. */
function fuse(world: World, s: GimbalState, tick: number): number {
  const into = beatPhaseTicks(world.cfg, tick);
  return (world.beat - s.seamBeat) * ticksPerBeat(world.cfg) + into;
}

/** The bead's centre on this tick, or `back` ticks before it. */
export function gimbalBeadNowMilli(world: World, s: GimbalState, back = 0): number {
  return Math.floor(gimbalBeadMilli(world.cfg, fuse(world, s, world.tick) - back));
}

/**
 * Where a bolt sweeping from `from` to `to` meets the bead, or -1 with none
 * leaking — once `boss-along.ts` has asked `gimbalVerdict` that the bolt is in
 * its column. The bead runs down as the bolt climbs, so a bead that crossed
 * the bolt between two ticks is met too, and the beam ends on it as a bolt
 * does.
 */
export function gimbalBeadAlong(world: World, from: number, to: number): number {
  const s = gimbalBoss(world);
  if (s === null || !gimbalLeaking(s)) return -1;
  const now = gimbalBeadNowMilli(world, s) - MEET_MILLI;
  const before = gimbalBeadNowMilli(world, s, 1) - MEET_MILLI;
  if (now < to || before > from) return -1;
  return Math.max(to, Math.min(from, now));
}
