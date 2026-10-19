import { msToTicks } from "./config-derived.js";
import type { World } from "./world.js";

/**
 * THE LOCK's rest: **one hold aims one shot**, and the next waits.
 *
 * A lock that lasted as long as the thumb did let the pilot park the cannon
 * for good — every body was a thumb away, and the strip under it went
 * unused. The owner's answer, 19 October 2026: the first lock of a wave is
 * instant, the shot it steers into the body spends it, and the lock rests
 * `lockRestMs` before a hand on a body is an aim again. In between, the cannon
 * is the only way a shot finds a column.
 *
 * It is a rest and not a hold. Nothing has to be pressed while it runs; a
 * light on the hull says when it is over, and a thumb already on a body when
 * it ends locks that body there and then.
 *
 * The count is in ticks left rather than the tick it ends on, because
 * `world.tick` is not monotonic (CLAUDE.md) and a count runs down the same on
 * either side of a reset.
 */

/** Whether a hand on a body may lock it now. */
export function lockReady(world: World): boolean {
  return world.lockRestTicks === 0;
}

/** The shot a lock steered has reached its body: the rest starts. */
export function spendLock(world: World): void {
  world.lockRestTicks = msToTicks(world.cfg, world.cfg.lockRestMs);
}

/** A wave starts with the lock ready. */
export function freeLock(world: World): void {
  world.lockRestTicks = 0;
}

/** One tick of the rest. */
export function stepLockRest(world: World): void {
  if (world.lockRestTicks > 0) world.lockRestTicks -= 1;
}

/**
 * How far the rest has run, in thousandths: 1000 is a lock ready to take.
 * What render/ draws the light from, so it asks rather than dividing by a
 * config field itself.
 */
export function lockChargeMilli(world: World): number {
  const full = msToTicks(world.cfg, world.cfg.lockRestMs);
  if (full <= 0) return 1000;
  return Math.round(((full - world.lockRestTicks) * 1000) / full);
}
