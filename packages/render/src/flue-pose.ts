import type { FlueState, SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE FLUE is posed off**: the flue sliding down into the field
 * as it arrives, and fading once every level is cleared.
 *
 * The ember is not posed: the simulation works out where it is every tick
 * (`sim/flue.ts` `flueEmberAlong`) and it is drawn exactly there, because
 * where it is drawn is the whole of what the pilot calls the shot off.
 */

/** The flue sliding down into the field as it arrives: 0 above it, 1 in place. */
export function flueArrived(s: FlueState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "slack" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.flueSlackBeats));
}

/** How far the spent flue has faded, 0 not spent and 1 gone. */
export function flueSpent(s: FlueState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "spent") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.flueSpentBeats));
}
