import type { World } from "./world.js";

/**
 * **The beat a fault is on**, and how often it acts — the one clock every
 * malfunction reads and none of them keeps.
 *
 * Cut out of `malfunction.ts` when the sixth fault took that file past its
 * 250-line limit, along the seam four files were already reaching across:
 * `codex.ts` and `handover.ts` both imported `faultStep` out of the fault
 * that does not use it, and `choke.ts` would have made a third. Nothing here
 * knows what a `Malfunction` is, which is what lets all of them import it.
 */

/**
 * How many beats into the wave a fault is, counted from the first one it acts
 * on rather than from zero.
 *
 * `onBeat` moves `waveBeat` before the fault reads it, so the first beat a
 * wave has is 1 and never 0 — and a sequence counted from 0 would open on the
 * *second* member of itself, which for an alternating cannon means the first
 * shot of the wave is cyan for no reason anybody could name. One subtraction,
 * in one place, read by every fault that counts.
 */
export function faultStep(world: World): number {
  return Math.max(0, world.waveBeat - 1);
}

/**
 * How many beats a fault placed on beat `at` has been running, and never below
 * zero.
 *
 * Every fault is a placement now (`fault-placed.ts`), so *the beat the wave is
 * on* and *the beat this fault is on* stopped being the same number on 15
 * September 2026. Everything a fault counts — which colour the runaway cannon
 * has loaded, whether it fires this beat — counts in this one, so a gun placed
 * at beat 10 opens on red and fires on its first beat exactly as one placed at
 * beat 0 does. A fault at 0 leaves the two numbers equal, which is why nothing
 * looked wrong while there was only ever one fault and it started the wave.
 */
export function faultStepIn(world: World, at: number): number {
  return Math.max(0, faultStep(world) - at);
}

/** How many beats apart the runaway cannon's shots are. Never below one. */
export function faultEvery(world: World): number {
  return Math.max(1, Math.round(world.cfg.malfunctionEveryBeats));
}

/**
 * Whether the runaway cannon or shield fires on the current beat. The emitter
 * that draws the shot asks the same question as the step that fires it, and
 * had its own copy of the answer until 12 September 2026.
 */
export function faultFiresThisBeat(world: World, at: number): boolean {
  return faultStepIn(world, at) % faultEvery(world) === 0;
}
