import { midCol } from "./config.js";
import type { RimeState } from "./rime.js";
import { openSlow } from "./slow.js";
import type { World } from "./world.js";

/**
 * **THE RIME's refreeze**, §29 row 11 of `docs/spec/bosses-choreographed.md`:
 * the third hit spends the core, and before the lens shatters a thin film
 * crawls back over it for `rimeRefreezeBeats`, asking both seats to send
 * nothing. After ten steps spent wiping, firing and shielding, the last one
 * asks the pair to leave it alone and let it crack on its own.
 *
 * **A reflex wipe or shield scatters the crack**: a beat is added to the
 * refreeze, once a beat and at most `rimeRefreezeScatters` times, and THE
 * SLOW is held open over the longer window. Nothing is lost by it — no hull
 * hit, no step asked again — only the beat. THE PLUMB's bleed is the same
 * shape.
 *
 * A wipe is heard as fresh reversals on either half (`rime-hand.ts`), a shield
 * as the guard pressed under the lens after the film began (`rime-guard.ts`).
 */
export function openRefreeze(world: World, s: RimeState): void {
  s.phase = "refreeze";
  s.phaseBeat = world.beat;
  s.litTick = world.tick;
  s.jars = 0;
  s.stirred = false;
  openSlow(world, world.cfg.rimeRefreezeBeats, "hold");
  world.events.push({ type: "rimeRefreeze", col: midCol(world.cfg) });
}

/** Whether the refreeze has run its beats, the scattered ones with them. */
export function stepRefreeze(world: World, s: RimeState, since: number): boolean {
  if (since >= world.cfg.rimeRefreezeBeats + s.jars) return true;
  s.stirred = false;
  return false;
}

/** A wipe or shield sent into the refreeze: the crack scatters, and a beat is added. */
export function rimeStirred(world: World, s: RimeState, side: 0 | 1): void {
  const cfg = world.cfg;
  if (s.phase !== "refreeze" || s.stirred || s.jars >= cfg.rimeRefreezeScatters) return;
  s.stirred = true;
  s.jars += 1;
  const since = world.beat - s.phaseBeat;
  openSlow(world, cfg.rimeRefreezeBeats + s.jars - since, "hold");
  world.events.push({ type: "rimeScatter", side, col: midCol(cfg) });
}
