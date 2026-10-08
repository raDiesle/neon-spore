import { failWave } from "./wave-fail.js";
import type { World } from "./world.js";

/**
 * **HARD's rule: a shot that met nothing loses the wave.** The owner, 25
 * September 2026 — *wave is lost, if a shot is hitting nothing, basically
 * wasted and hitting the top line of game screen.* Asked of a bolt the caller
 * already knows met nothing: out of the top with no boss above to take it
 * (`shot-out.ts`), or THE LEAD's flight come down where the body is not
 * (`lead-step.ts`).
 *
 * What is left to ask is whether the wave is still being played: a bolt still
 * climbing when the last body went is not a shot at nothing, it is a shot the
 * rest after a clear caught in the air (`clearHolds`). THE WELL is out of it
 * as well: its field is a disc, and a disc has no top line to hit. So is THE
 * TRAPEZE: a bolt at its swing is a shove at a moving alien, not a shot at a
 * target, and a near miss flies out of the top.
 *
 * Its own file because the two callers are a cycle apart: `shot-out.ts`
 * imports THE LEAD's hook, which imports its clock.
 */
export function shotWasted(world: World): boolean {
  if (!world.cfg.wastedShotFails) return false;
  if (world.boss?.kind === "well" || world.boss?.kind === "trapeze") return false;
  return world.restBeat === 0;
}

/** A bolt that met nothing, told to the wave: lost, if HARD says so. */
export function wasteShot(world: World): void {
  if (shotWasted(world)) failWave(world);
}
