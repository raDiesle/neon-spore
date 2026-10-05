import { type SimConfig, ticksPerBeat } from "./config.js";
import {
  type FlueLevel,
  type FlueState,
  type FlueWeapon,
  flueEmberAlong,
  flueLitLevel,
} from "./flue.js";
import { primeTicks } from "./lance.js";
import { shotClimbTicks, shotLandsTick } from "./warden-lead.js";
import { MILLI, type World } from "./world.js";

/**
 * **Where THE FLUE's ember will be when a shot pressed now reaches it** —
 * the lead the pilot has to call, worked out the way AUTO and the tests need
 * it.
 *
 * A bolt reaches the ember's row when THE WARDEN's does a body on it
 * (`shotLandsTick`, the grid's wait and all); a beam goes off at the top of
 * its fill and burns the whole column on that tick (`lance-burn.ts`), so a
 * held colour reaches the ember `primeTicks` after the thumb went down.
 * Nothing here is more than the pilot can see: the ember runs at one speed
 * end to end, and *two before the cannon, going right* is a sentence.
 */

/** Ticks from a press now to the shot meeting the ember's row. */
export function flueShotTicks(world: World, weapon: FlueWeapon): number {
  if (weapon === "beam") return primeTicks(world.cfg);
  return shotLandsTick(world, world.cfg.flueRow) - world.tick;
}

/** Where the ember will be, thousandths of a column off the middle, when a shot pressed now meets its row. */
export function flueEmberMet(world: World, s: FlueState, weapon: FlueWeapon): number | null {
  const level = flueLitLevel(s);
  if (level === null) return null;
  return flueEmberRun(world.cfg, level, s.rollTicks + flueShotTicks(world, weapon)).milli;
}

/**
 * **The ember on the shot grid's beat.** On the game's half-beat grid
 * (`shotChargeBeats`, `shot-charge.ts`) a bolt only ever leaves on a half
 * beat, so it only ever reaches the flue a climb after one, and a level
 * whose ember crossed the middle between two of those would have no shot
 * that met it, however well it was called — what AUTO was finding in `bun
 * run frames`, THE WARDEN's lesson again. So the ember waits at the left end
 * for under half a beat as a level lights, by as much as puts its crossing
 * of the middle on a bolt's arrival; and a level's speed divides four spans
 * (`content/test/flue-levels.test.ts`), so the run end to end and back is a
 * whole number of half beats and every crossing after the first is on one
 * too. A beam is not on the grid and meets it anywhere.
 */
export function flueEmberWait(cfg: SimConfig, speedMilli: number): number {
  const tpb = ticksPerBeat(cfg);
  const half = (tpb * MILLI) / 2;
  const cross = Math.floor((cfg.flueSpanMilli * tpb * MILLI) / Math.max(1, speedMilli));
  const climb = shotClimbTicks(cfg, cfg.flueRow) * MILLI;
  const wait = (((climb - cross) % half) + half) % half;
  return Math.round(wait / MILLI);
}

/** The ember `ticks` into a level: held at the left end for its wait, then running. */
export function flueEmberRun(
  cfg: SimConfig,
  level: FlueLevel,
  ticks: number,
): { milli: number; dir: 1 | -1 } {
  const wait = flueEmberWait(cfg, level.speedMilli);
  return flueEmberAlong(cfg, level.speedMilli, Math.max(0, ticks - wait));
}
