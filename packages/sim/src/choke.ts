import { clampCol } from "./config-derived.js";
import { faultStep } from "./fault-clock.js";
import { spillPrime } from "./lance.js";
import type { World } from "./world.js";

/**
 * **THE CHOKE**: the one fault that breaks the half that moves.
 *
 * The cannon strip answers nobody and the cannon walks wall to wall, a column
 * every `chokeSweepBeats` beats, while player 2 goes on firing from wherever
 * it happens to be. It was a body once — a strand that fell, took the cannon
 * and was tapped off — and the owner made it a fault on 12 September 2026:
 * the same kind of thing as the other faults, authored on the wave, with the
 * emitter as its cause and no brush.
 *
 * Its own file since the sixth fault took `malfunction.ts` past its 250-line
 * limit. It is the fault with the most arithmetic behind it and the only one
 * that writes to the world on a beat, so it is also the one that reads worst
 * inside a file about the whole family (`malfunction.ts` has that family, and
 * `fault-clock.ts` the beat they all count).
 */

/**
 * How many steps the steered cannon has taken by this beat: none until the
 * wave's second beat, then one every `chokeSweepBeats`.
 */
function steerSteps(world: World): number {
  const every = Math.max(1, Math.round(world.cfg.chokeSweepBeats));
  return Math.floor(faultStep(world) / every);
}

/**
 * **Where the steered cannon stands after `steps` steps**, and no state
 * behind it. `startWave` puts the cannon in the middle of every wave, and
 * from there the walk is a triangle wave: right to the wall, back to the
 * other, and again — a function of the wave's beat, so nothing is added to
 * the world or the hash. Away from the nearer wall first is what the middle
 * gives for free: the first thing the pair sees is the cannon leaving.
 */
export function steerCol(cols: number, steps: number): number {
  const last = cols - 1;
  const period = Math.max(1, last * 2);
  const x = (Math.floor(last / 2) + steps) % period;
  return x <= last ? x : period - x;
}

/** Which way the steered cannon steps next, `1` toward the right wall. */
export function steerHeading(world: World): -1 | 1 {
  const cols = world.cfg.cols;
  const steps = steerSteps(world);
  return steerCol(cols, steps + 1) >= steerCol(cols, steps) ? 1 : -1;
}

/** Whether this wave's fault is THE CHOKE — the strip dead, the cannon walking. */
export function steered(world: World): boolean {
  return world.malfunction?.kind === "steer";
}

/**
 * The walk, on the beat. A cannon that moved out of the column a thumb was
 * filling in spills the lobe exactly as a pilot's own slide does — the fault
 * holds the strip, not the rule (`lance.ts`).
 */
export function stepChoke(world: World): void {
  const from = world.cannonCol;
  world.cannonCol = clampCol(world.cfg, steerCol(world.cfg.cols, steerSteps(world)));
  if (from !== world.cannonCol && spillPrime(world))
    world.events.push({ type: "lanceSpilled", col: from });
}
