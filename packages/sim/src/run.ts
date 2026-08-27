import { emptyRunStats } from "./balance.js";
import { createRng } from "./rng.js";
import { MILLI, type World } from "./world.js";

/**
 * The run, as opposed to the beat.
 *
 * `beat.ts` is what happens on a beat and `startWave` is what happens at the
 * top of a wave; these three are neither. They wipe or rewind a whole run —
 * the hull, the score, the balance sheet, and in one case the clock itself —
 * and they are called from outside the loop rather than from inside it.
 */

/**
 * Wipe the run itself: hull, scars, score and balance. Used by a restart after
 * the hull is through, and by jumping to a wave in the test build.
 */
export function resetRun(world: World): void {
  world.hullMilli = 100 * MILLI;
  world.scars = [];
  world.score = 0;
  world.over = false;
  world.guard.tries = 0;
  world.guard.deflected = 0;
  world.guard.mistimed = 0;
  world.balance = emptyRunStats();
}

/**
 * End the run where it stands, without waiting for the hull to go. The game
 * never calls this — there the hull decides — but the director does, because
 * it plays with the hull held (`hullInvulnerable`) and the balance sheet is a
 * screen that has to be reachable to be judged.
 */
export function endRun(world: World): void {
  world.over = true;
}

/**
 * Put the clock itself back to zero: tick, beat, the id counter and the seeded
 * rng. `resetRun` deliberately leaves all four alone — a restart mid-session is
 * one continuous run, and the tick counter is what every window in the game is
 * measured against.
 *
 * Two devices agreeing to start together is the one case where they must go
 * back. Delayed lockstep numbers every command by the tick it takes effect on,
 * so two worlds that begin on different tick counts are not one game played
 * twice; they are two games. Call this, then `resetRun`, then `startWave`.
 *
 * Never from inside `step`: the tick is being counted there.
 */
export function resetClock(world: World, seed: number): void {
  world.tick = 0;
  world.beat = 0;
  world.nextId = 1;
  world.rng = createRng(seed);
}
