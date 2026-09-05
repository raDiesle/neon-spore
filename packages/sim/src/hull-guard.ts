import { hullRow, msToTicks, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * **The shield's own arithmetic**: where it stands, how long its window is
 * open, and whether it answers this tick.
 *
 * Split out of `hull.ts` when that file reached its 250-line ceiling. The seam
 * is the one `hull.ts` was already written along: everything here is about the
 * thing that *turns* a rock away, and everything left there is about what
 * happens when nothing did. `hull.ts` re-exports all four, so nothing that
 * already reached for them through that file had to move.
 */

/**
 * The row the shield answers a rock on: one above the ship's own.
 *
 * The shield is not painted on the hull, it stands off it — a closed dome
 * whose crown sits about a third of a tile above the hull row's centre, which
 * is roughly where a rock's underside first touches something. So a rock that
 * is only tested when it stands *on* the ship has already gone through the
 * thing that was supposed to turn it, and both of the things the owner
 * reported follow from that: the trigger does nothing at the moment the rock
 * meets the shield, and a rock that is turned turns from inside it.
 *
 * A rule rather than `hullRow(cfg) - 1` written out where it is needed —
 * that shape is a second copy of where the shield is, and it will drift.
 */
export function shieldRow(cfg: SimConfig): number {
  return Math.max(0, hullRow(cfg) - 1);
}

/** Ticks the guard window stays open, from `guardWindowMs` at this tick rate. */
export function guardWindowTicks(cfg: SimConfig): number {
  return msToTicks(cfg, cfg.guardWindowMs);
}

/**
 * Whether the shield answers a rock this tick — the one place that decides it.
 *
 * Two ways to be armed and both belong here: a trigger whose window has not
 * run out yet, and a ward pod holding the shield open without one. Anything
 * that draws the button, sounds it or resolves a rock asks this rather than
 * spelling the window out again; four spellings of it disagreed by a tick at
 * the closing edge, and the ward term was missing from three of them, so the
 * glow said "closed" while `resolveHull` was still turning rocks away.
 */
export function guardArmed(world: World): boolean {
  const windowTicks = guardWindowTicks(world.cfg);
  // A ward frees player 1 from the *timing* only, not from the aiming — the
  // shield still has to be in the meteor's column, so player 2's job is
  // untouched.
  return (
    (world.tick - world.guardTick <= windowTicks && world.guardTick <= world.tick) ||
    world.tick <= world.wardUntilTick
  );
}

/**
 * Ticks since the guard window closed; negative while it is still open.
 *
 * The button's afterglow is the only thing that needs the moment of closing
 * rather than the state, and it gets it from here instead of subtracting the
 * window itself for a second time.
 */
export function ticksSinceGuard(world: World): number {
  return world.tick - world.guardTick - guardWindowTicks(world.cfg);
}
