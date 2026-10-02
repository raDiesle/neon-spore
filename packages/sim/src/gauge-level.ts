import type { SimConfig } from "./config.js";
import type { GaugeState } from "./gauge.js";
import { gaugeLoosenTongue } from "./gauge-tongue.js";
import { gaugeLoosenTooth } from "./gauge-tooth.js";
import type { World } from "./world.js";

/**
 * **THE GAUGE's levels**: three rounds of the same rule, each harder.
 *
 * The owner, 29 September 2026: *add more levels (at least 3 and it should
 * become harder, maybe the mouth moves faster like in waves or becomes bigger
 * every level)*. So a level is `gaugeLevelMarks` marks against a clock of its
 * own, and each level up walks the band faster and cuts it narrower. The rule
 * the pair is playing never changes; what changes is how long "now" lasts.
 *
 * `marks` counts the whole round and `level` says how many levels are behind
 * it, so a level's own count is the difference — one number that can never
 * disagree with the other, rather than two kept in step.
 *
 * Between two levels the rim stands bare for `gaugeLevelRestBeats` with the
 * next level's clock held full: the pair has just finished something, and the
 * break is where they hear that it counted.
 */

/** How far the band walks each beat on this level. */
export function gaugeLevelDrift(cfg: SimConfig, gauge: GaugeState): number {
  return cfg.gaugeDriftMilli + gauge.level * cfg.gaugeLevelDriftMilli;
}

/** Marks made on this level alone. */
export function gaugeLevelMarksMade(cfg: SimConfig, gauge: GaugeState): number {
  return gauge.marks - gauge.level * cfg.gaugeLevelMarks;
}

/** Whether the last level is done, which is the round passed. */
export function gaugeAllLevels(cfg: SimConfig, gauge: GaugeState): boolean {
  return gauge.marks >= cfg.gaugeLevels * cfg.gaugeLevelMarks;
}

/** Whether the rim is bare between two levels, with the next one's clock held. */
export function gaugeBetweenLevels(world: World, gauge: GaugeState): boolean {
  return gauge.level > 0 && world.beat < gauge.levelBeat;
}

/**
 * After a mark: if it finished a level that is not the last, the next begins
 * after a rest. Returns whether it did, so the caller does not wind the band on
 * the mark that ended a level — a new level opens free, with nothing jammed and
 * nothing bound.
 */
export function gaugeLevelUp(world: World, gauge: GaugeState): boolean {
  const cfg = world.cfg;
  if (gaugeLevelMarksMade(cfg, gauge) < cfg.gaugeLevelMarks) return false;
  if (gaugeAllLevels(cfg, gauge)) return false;
  gauge.level += 1;
  gauge.levelBeat = world.beat + cfg.gaugeLevelRestBeats;
  gauge.regrowBeat = gauge.levelBeat;
  gauge.boundBeat = -1;
  gauge.jamBeat = -1;
  // One rest is spent on a tooth instead, and one on the tongue
  // (`gauge-tooth.ts`, `gauge-tongue.ts`).
  gaugeLoosenTooth(world, gauge);
  gaugeLoosenTongue(world, gauge);
  return true;
}
