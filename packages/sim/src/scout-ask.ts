import type { ScoutArena, ScoutState } from "./scout.js";

/**
 * **The four questions every THE SCOUT file asks of the round**, cut off
 * `scout.ts` when the owner's pass of 29 September 2026 gave the state four
 * more fields and took that file past its 250 lines. `scout.ts` is what the
 * round remembers; this is what is read off it.
 */

/** The arena being flown, or the last one when the round is over. */
export function scoutCurrent(scout: ScoutState): ScoutArena {
  return scout.arenas[Math.min(scout.arena, scout.arenas.length - 1)] as ScoutArena;
}

/**
 * Whether every mote in the current arena has been brought home.
 *
 * Banked and not merely collected: a ship full of motes that never came back
 * is a round nobody finished, which is the whole of what the second seat's
 * hand is for.
 */
export function scoutCleared(scout: ScoutState): boolean {
  return scout.banked.length >= scoutCurrent(scout).motes.length;
}

/** How many motes are still to be banked — out there or aboard. What the picture counts. */
export function scoutLeft(scout: ScoutState): number {
  return Math.max(0, scoutCurrent(scout).motes.length - scout.banked.length);
}

/** Whether the mother ship's mouth is open on this tick. */
export function scoutMawOpen(scout: ScoutState, tick: number, mawTicks: number): boolean {
  return scout.mawTick >= 0 && tick - scout.mawTick < mawTicks;
}
