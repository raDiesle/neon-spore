import { type SimConfig, ticksPerBeat } from "./config.js";
import { MILLI, type World } from "./world.js";

/**
 * THE LANCE: marking, re-grounded on the raster.
 *
 * Marking (docs/spec/couplings.md 2) was written for free flight — player 1
 * held an aim beam on a creature until the mark locked and player 2 fired the
 * matching colour. There is no beam any more; there is a column. So the mark
 * is on the column, and the thing that locks is the cannon lobe itself: player
 * 1 holds the lance down and the lobe fills, one beat at a time, for as long
 * as the cannon stands still.
 *
 * **The cost is the hand, exactly as it is for THE GRIP.** The thumb filling
 * the lobe is a thumb off the trigger, and a cannon that must not move is a
 * cannon that cannot answer another column. A pair that primes while rocks are
 * falling has decided to take one.
 *
 * **The shot is player 2's, and it is the same shot as always.** There is no
 * second fire button: whatever is in the lobe leaves with the next shot that
 * goes out through it. Full, and it is a lance — half speed, and it passes
 * through bodies of its own colour instead of stopping at the first. Part
 * full, and the shot is an ordinary one and the charge is simply gone. That is
 * the whole coupling in one sentence: **player 2 has to not fire** while the
 * lobe fills, which is a thing only player 1 can ask for and only player 2 can
 * do. Neither half is any use alone.
 */

/** No thumb on the lance. `world.primeTick` carries this when nothing is filling. */
export const NO_PRIME = -1;

/**
 * Ticks of holding before the lobe is full. At least one, so a config that
 * asks for no wait at all still has a moment to be ready *at* rather than
 * dividing by zero on its way to a percentage.
 */
export function primeTicks(cfg: SimConfig): number {
  return Math.max(1, Math.round(cfg.lancePrimeBeats * ticksPerBeat(cfg)));
}

/**
 * The thumb goes down. A second press while one is already filling changes
 * nothing — the fill is timed from the first, or a stray repeat from the host
 * would silently restart a lobe that was nearly full.
 */
export function startPrime(world: World): void {
  if (world.primeTick !== NO_PRIME) return;
  world.primeTick = world.tick;
}

/**
 * The thumb lifts, the cannon moves, the maw opens, or a shot takes what was
 * in there. Nothing decays a charge except this — it is a hold, not a timer.
 */
export function endPrime(world: World): void {
  world.primeTick = NO_PRIME;
}

/** Whether the lobe is filling at all. */
export function priming(world: World): boolean {
  return world.primeTick !== NO_PRIME;
}

/**
 * How full the lobe is, in thousandths. 1000 is a lance ready to go, 0 is a
 * thumb that is not down. render/ draws this and nothing re-derives it: the
 * ring on the button and the mark on the field are the same number twice.
 */
export function primeChargeMilli(world: World): number {
  if (!priming(world)) return 0;
  const have = world.tick - world.primeTick;
  return Math.max(0, Math.min(MILLI, Math.round((have * MILLI) / primeTicks(world.cfg))));
}

/** Whether the next shot out of this lobe is a lance. */
export function lanceReady(world: World): boolean {
  return priming(world) && world.tick - world.primeTick >= primeTicks(world.cfg);
}

/**
 * The one tick the lobe comes full on, reported once. Both players are told:
 * the mark is the one row of the information split that is not split at all
 * (docs/spec/systems.md 5.2), because the player who has to fire it and the
 * player who has to hold it are different people.
 */
export function noteLanceFull(world: World): void {
  if (!priming(world)) return;
  if (world.tick - world.primeTick !== primeTicks(world.cfg)) return;
  world.events.push({ type: "lanceFull", col: world.cannonCol });
}
