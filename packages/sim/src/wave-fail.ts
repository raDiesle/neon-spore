import { ticksPerBeat } from "./config-derived.js";
import type { World } from "./world.js";

/**
 * A hit fails the wave, and the wave is played again.
 *
 * The owner's rule, 12 September 2026: *every hull damage fails the wave*,
 * and a wave is passed only when everything it sent has been destroyed,
 * evaded, sucked in or shielded — each by its own mechanic. What the run
 * keeps is not a hull and a score but **how long the pair took and how many
 * times they went again**, across every wave until the last one is cleared.
 * The hull's points, the bar that showed them and the game over they ended in
 * are on their way out (`docs/spec/structure.md`).
 *
 * **The moment of the hit is the moment the wave stops.** `failWave` is what
 * `applyHullDamage` does now: it marks the tick, counts the retry and says so
 * in an event. From then on `step` holds the field the way an opening does —
 * nothing falls, nothing fires, the tick still counts — for `waveFailBeats`,
 * so the breach is seen where it happened; then the same wave is asked for
 * (`needWave` with `retry`), once, and the field stays held until the host
 * answers. Two devices agree about all of it because every part is the
 * world's: `failTick`, `retries` and `playTicks` are in `hashWorld`.
 *
 * **What the clock counts is play.** A tick goes on `playTicks` when the wave
 * is live — not while its opening or guide holds the field, not in the pause
 * after a hit, not in the rest after a clear, not once the run is over. The
 * time a lost wave cost is in it, because that time was played.
 */

/** `failTick` while no hit has failed this opening of the wave. */
export const NOT_FAILED = -1;
/** `failTick` once the retry has been asked for — asked once, held until answered. */
const ASKED = -2;

/** The hull took damage: the wave is lost, from this tick. */
export function failWave(world: World): void {
  if (world.cfg.hullInvulnerable || world.over) return;
  if (world.failTick !== NOT_FAILED) return;
  world.failTick = world.tick;
  world.retries += 1;
  world.events.push({ type: "waveFailed", wave: world.wave, retries: world.retries });
}

/** Whether a hit is holding the field — the pause, and the wait for the host after it. */
export function failHolds(world: World): boolean {
  return world.failTick !== NOT_FAILED;
}

/** One tick of the hold: when the pause is spent, the same wave is asked for, once. */
export function stepFailHold(world: World): void {
  if (world.failTick < 0) return;
  if (world.tick - world.failTick < world.cfg.waveFailBeats * ticksPerBeat(world.cfg)) return;
  world.failTick = ASKED;
  world.events.push({ type: "needWave", wave: world.wave, retry: true });
}

/** One tick on the run's clock, if the wave is live. */
export function countPlay(world: World): void {
  if (world.over || world.restBeat !== 0) return;
  world.playTicks += 1;
}

/** The run's clock in whole seconds. */
export function playSeconds(world: World): number {
  return Math.floor(world.playTicks / world.cfg.tickHz);
}
