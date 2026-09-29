import type { ScoutTripConfig } from "./config-scout-trip.js";

/**
 * **When the pilot is shown the arena**: a second of it, one beat after the
 * ship is let go and every five seconds after that.
 *
 * The owner, 29 September 2026: *every 5 seconds also player 1 sees for a
 * brief moment all obstacles and powerups, and after 1 beat on game start*.
 * The split still stands — the seat that flies cannot *keep* the arena, only
 * catch sight of it, so the other seat is still the one that says where to go
 * — and the glimpse is what lets the pilot check that what they were told is
 * what is there.
 *
 * Counted in ticks off the arena's own start (`ScoutState.arenaTick`) because
 * they are seconds and a tick is a hundred-and-twentieth of one; a beat is
 * whatever the wave's tempo makes it. Nothing here writes to the world: the
 * showing is a picture, and both devices draw it off the same tick.
 *
 * `sinceTicks` may carry a fraction, so the picture can ease the arena in and
 * out between two ticks; the answer is the same rule either way.
 */
export function scoutRevealOpen(cfg: ScoutTripConfig, sinceTicks: number): boolean {
  return scoutRevealThrough(cfg, sinceTicks) !== null;
}

/**
 * How far through the current showing `sinceTicks` is, 0 to 1, or `null`
 * between showings. The picture tears the arena in over the start of it and
 * out over the end (`render/scout-reveal.ts`).
 */
export function scoutRevealThrough(cfg: ScoutTripConfig, sinceTicks: number): number | null {
  const from = sinceTicks - cfg.scoutRevealFirstTicks;
  if (from < 0) return null;
  const at = from % cfg.scoutRevealEveryTicks;
  if (at >= cfg.scoutRevealTicks) return null;
  return at / cfg.scoutRevealTicks;
}
