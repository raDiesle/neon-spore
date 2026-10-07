import { beatSeconds, type SimConfig, type SinewState } from "@neon-spore/sim";
import { IDLE_DRIFT } from "./idle-drift.js";
import { OUTLINE_SEED, outlineDrift } from "./outline-drift.js";
import { noise1 } from "./solid-motion.js";

/**
 * **THE SINEW's mass swings on its tendon like a weight on a rope**
 * (`docs/spec/living-bosses.md` §1, the outline tier). The crown and the
 * collar hold still — the collar is the gauge, read at rest
 * (`sinewCollarBox`) — and the mass under it wanders across by more than half
 * a tile, rising a little at either end of its swing as a pendulum does. That
 * is seen (*Big enough to be seen*, `docs/looks.md`).
 *
 * **The handles a thumb holds ride on the mass**, and their hit test reads
 * the same centre the canvas draws (`sinewMassCentre`), off the beat, which a
 * hit test has (`touch-field.ts`) — THE WARDEN's arrangement.
 *
 * **Still once it falls.** The walk down a column a beat is the readout, and
 * THE SLOW asks for the handles over the whole of it (`sinew-step.ts`), so
 * the swing eases out over the window's first half beat, the time the hush
 * test lets a mark settle in. Still once it has landed.
 */

/** How far the mass swings across at the widest, in tiles. */
export const SINEW_SWAY = 0.9;
/** How long the tendon is, crown to mass, in tiles: what the rise at either end of a swing is measured on. */
const TENDON = 3.3;
/** Beats the swing takes to die once the mass falls. */
const FALL_EASE = 0.5;

/** The swing at `beat` and `beatPhase`, in tiles: across, and the rise at its end (up is negative). */
export function sinewSway(
  cfg: SimConfig,
  s: SinewState,
  beat: number,
  beatPhase: number,
): { readonly x: number; readonly y: number } {
  const k = outlineDrift("sinew");
  if (k <= 0 || s.outBeat >= 0) return { x: 0, y: 0 };
  const b = beat + beatPhase;
  const ease = s.fallBeat >= 0 ? Math.max(0, Math.min(1, 1 - (b - s.fallBeat) / FALL_EASE)) : 1;
  if (ease <= 0) return { x: 0, y: 0 };
  const seconds = b * beatSeconds(cfg);
  const x =
    k * ease * SINEW_SWAY * noise1((seconds * 2) / IDLE_DRIFT.roll.period, OUTLINE_SEED.sinew);
  return { x, y: -(TENDON - Math.sqrt(TENDON * TENDON - x * x)) };
}
