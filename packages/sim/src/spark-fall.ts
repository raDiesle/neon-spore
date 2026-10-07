import { beatPhaseTicks } from "./beat-clock.js";
import { type SimConfig, ticksPerBeat } from "./config.js";
import type { World } from "./world.js";

/**
 * **A spark falling down one column to the hull**, eased in and out, in the
 * field's own thousandths of a row: THE GIMBAL's leaking bead
 * (`gimbal-bead.ts`), THE MANTLE's spark off the bared core and THE VALVE's
 * off the drum (`mantle-shot.ts`, `valve-shot.ts`). Each starts at its own
 * row and runs for its own beats; the fall itself is one shape.
 *
 * A bolt meets the spark *there*, on the tick it reaches it, rather than when
 * it leaves the top of the field — the owner, 5 October 2026, *take effect
 * immediately it hit the right location* — and the picture lays the spark
 * off the same number (`render/gimbal-drum.ts`, `render/mantle-pose.ts`,
 * `render/valve-spark.ts`), so the two cannot drift apart.
 */

/** Where every spark ends: the hull's top edge. */
export function sparkHullMilli(cfg: SimConfig): number {
  return cfg.rows * 1000 - 1500;
}

/**
 * The spark's centre `fuseTicks` after it leaked (a fraction of a tick is
 * the picture's, between two), falling from `fromMilli` to the hull over
 * `beats`.
 */
export function sparkFallMilli(
  cfg: SimConfig,
  fromMilli: number,
  beats: number,
  fuseTicks: number,
): number {
  const total = Math.max(1, beats) * ticksPerBeat(cfg);
  const p = Math.max(0, Math.min(1000, (fuseTicks * 1000) / total));
  const eased = (p * p * (3000 - 2 * p)) / 1e6;
  return fromMilli + ((sparkHullMilli(cfg) - fromMilli) * eased) / 1000;
}

/** How many ticks a spark that leaked on `sinceBeat` has run on `tick`. */
export function sparkFuseTicks(world: World, sinceBeat: number, tick: number): number {
  return (world.beat - sinceBeat) * ticksPerBeat(world.cfg) + beatPhaseTicks(world.cfg, tick);
}

/**
 * How far past a spark's centre a bolt is met, thousandths of a row: beyond
 * its far rim, so the picture always has a frame of the bolt bursting on its
 * near one before the bolt is taken off the field — the spark runs down to
 * meet the bolt as it climbs, and the gap closes up to a fifth of a row a tick.
 */
const MEET_MILLI = 500;

/**
 * Where a bolt sweeping from `from` to `to` meets a spark whose centre was
 * at `before` a tick ago and is at `now`, or -1. The spark runs down as the
 * bolt climbs, so one that crossed the bolt between two ticks is met too.
 */
export function sparkMeets(now: number, before: number, from: number, to: number): number {
  const at = now - MEET_MILLI;
  if (at < to || before - MEET_MILLI > from) return -1;
  return Math.max(to, Math.min(from, at));
}
