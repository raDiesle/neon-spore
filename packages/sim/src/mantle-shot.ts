import type { SimConfig } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { type MantleState, mantleBoss, mantleLeaking, NO_SPARK } from "./mantle.js";
import { sparkFallMilli, sparkFuseTicks, sparkMeets } from "./spark-fall.js";
import type { Bullet, Color } from "./types.js";
import type { World } from "./world.js";

/**
 * **THE MANTLE's one target**: the spark leaking from the bared core once the
 * shell is fully split (§23, between movements 2 and 3).
 *
 * **Either colour.** The design says *own colour*, and both of them are: a
 * spark is not a body with a colour the pair could have got wrong, the same
 * rule THE GIMBAL's seam already uses. What it costs to miss is the column,
 * and the column is the middle.
 *
 * What it says of a bolt is `mantleVerdict`, which the picture asks too
 * (`render/mantle-stop.ts`).
 */
export function mantleStruck(world: World, bullet: Bullet): boolean {
  const s = mantleBoss(world);
  if (s === null || mantleVerdict(world, bullet.col, bullet.color) === null) return false;
  const rowMilli = mantleSparkNowMilli(world, s);
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "mantleSparkOut", col: bullet.col, rowMilli });
  return true;
}

/**
 * What a bolt in `col` meets of the leak (`core-verdict.ts`'s words): the
 * spark in its column while it leaks, in either colour, and nothing anywhere
 * else — the shell and the core are never judged.
 */
export function mantleVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = mantleBoss(world);
  return s !== null && mantleLeaking(s) && col === s.sparkCol ? "target" : null;
}

/** Where the spark leaks from: the gap under the split shell, five rows and four tenths down the field. */
export const MANTLE_SPARK_FROM_MILLI = 4900;

/** The spark's centre `fuseTicks` after it leaked, falling to the hull (`spark-fall.ts`). */
export function mantleSparkMilli(cfg: SimConfig, fuseTicks: number): number {
  return sparkFallMilli(cfg, MANTLE_SPARK_FROM_MILLI, cfg.mantleSparkBeats, fuseTicks);
}

/** The spark's centre on this tick, or `back` ticks before it. */
export function mantleSparkNowMilli(world: World, s: MantleState, back = 0): number {
  return Math.floor(
    mantleSparkMilli(world.cfg, sparkFuseTicks(world, s.sparkBeat, world.tick) - back),
  );
}

/**
 * Where a bolt in its column sweeping from `from` to `to` meets the spark,
 * or -1 — asked in `boss-along.ts`, so the spark is put out where it is drawn
 * put out rather than when the bolt leaves the top of the field.
 */
export function mantleSparkAlong(world: World, b: Bullet, from: number, to: number): number {
  const s = mantleBoss(world);
  if (s === null || mantleVerdict(world, b.col, b.color) === null) return -1;
  return sparkMeets(mantleSparkNowMilli(world, s), mantleSparkNowMilli(world, s, 1), from, to);
}
