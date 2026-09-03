import { guardArmed, msToTicks, ticksSinceGuard, type World } from "@neon-spore/sim";

/**
 * How long the guard button (`band.ts`) keeps fading after its own window
 * closes, in milliseconds. Render-only: `cfg.guardWindowMs` decides when a
 * press stops being able to deflect anything, and that timing is untouched —
 * this is only how long the *picture* of that moment lingers.
 *
 * Short enough to clear inside a beat at the shipped tempo (96 bpm is about
 * 625ms) so it never overlaps the next press's own arm-and-fade, long enough
 * that a glance not fixed on the button still catches the flash going out
 * rather than finding a dark button that offers no further clue.
 */
const GUARD_LAPSE_MS = 300;

/**
 * 1 the instant the guard's window closes, fading to 0 over `GUARD_LAPSE_MS`.
 * 0 while still armed, and 0 again once the fade is done — idle and lapsed
 * settle back to the same dark button: only going out is a signal.
 *
 * Computed from the simulation's own `guardArmed` and `ticksSinceGuard`, so
 * nothing is stored here and nothing is derived twice: this only says out loud
 * what `resolveHull` already decided. It fires on every press's window
 * closing, deflect or no deflect — the button has no way to know which, and a
 * deflect gets its own, louder feedback in `deflect.ts`.
 */
export function guardLapse(world: World): number {
  // A ward can hold the shield armed past a press's own window; the fade is
  // about the guard going out, not about that window.
  if (guardArmed(world)) return 0;
  const afterglowTicks = msToTicks(world.cfg, GUARD_LAPSE_MS);
  const sinceExpiry = ticksSinceGuard(world);
  if (sinceExpiry < 0 || sinceExpiry >= afterglowTicks) return 0;
  return 1 - sinceExpiry / afterglowTicks;
}
