import type { SimConfig } from "./config.js";
import type { CoreVerdict } from "./core-verdict.js";
import { NO_SPARK } from "./mantle.js";
import { sparkFallMilli, sparkFuseTicks, sparkMeets } from "./spark-fall.js";
import type { Bullet, Color } from "./types.js";
import { type ValveState, valveBoss, valveLeaking } from "./valve.js";
import type { World } from "./world.js";

/**
 * **THE VALVE's one target**: the spark the first two pins leak down the
 * drum's column, one at a time, where a bolt leaves the top of the field.
 *
 * **It wants either colour**, THE MANTLE's spark's and THE KEEL's rock's
 * argument: a spark is not a body with a colour the pair could have got
 * wrong, and what it costs to miss is the hull. The drum itself takes no
 * shot at all — every pin comes out by hand.
 *
 * What it says of a bolt is `valveVerdict`, which the picture asks too
 * (`render/valve-stop.ts`).
 */
export function valveStruck(world: World, bullet: Bullet): boolean {
  const s = valveBoss(world);
  if (s === null || valveVerdict(world, bullet.col, bullet.color) === null) return false;
  const rowMilli = valveSparkNowMilli(world, s);
  s.sparkCol = NO_SPARK;
  world.events.push({ type: "valveSparkOut", col: bullet.col, rowMilli });
  return true;
}

/**
 * What a bolt in `col` meets of the leak (`core-verdict.ts`'s words): the
 * spark in its column while it falls, in either colour, and nothing anywhere
 * else — the drum is never judged.
 */
export function valveVerdict(world: World, col: number, _color: Color): CoreVerdict {
  const s = valveBoss(world);
  return s !== null && valveLeaking(s) && col === s.sparkCol ? "target" : null;
}

/** Where the spark leaks from: the drum's lower rim, three rows and nine tenths down the field. */
export const VALVE_SPARK_FROM_MILLI = 3400;

/** The spark's centre `fuseTicks` after it leaked, falling to the hull (`spark-fall.ts`). */
export function valveSparkMilli(cfg: SimConfig, fuseTicks: number): number {
  return sparkFallMilli(cfg, VALVE_SPARK_FROM_MILLI, cfg.valveSparkBeats, fuseTicks);
}

/** The spark's centre on this tick, or `back` ticks before it. */
export function valveSparkNowMilli(world: World, s: ValveState, back = 0): number {
  return Math.floor(
    valveSparkMilli(world.cfg, sparkFuseTicks(world, s.sparkBeat, world.tick) - back),
  );
}

/**
 * Where a bolt in its column sweeping from `from` to `to` meets the spark,
 * or -1 — asked in `boss-along.ts`, so the spark is put out where it is drawn
 * put out rather than when the bolt leaves the top of the field.
 */
export function valveSparkAlong(world: World, b: Bullet, from: number, to: number): number {
  const s = valveBoss(world);
  if (s === null || valveVerdict(world, b.col, b.color) === null) return -1;
  return sparkMeets(valveSparkNowMilli(world, s), valveSparkNowMilli(world, s, 1), from, to);
}
