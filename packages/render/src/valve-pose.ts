import { type SimConfig, VALVE_PINS, type ValveState } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE VALVE is posed off** (§25, *Animation*): four poses —
 * sealed and upright, listing one pin, listing two, face open — each eased
 * over its phase's own beats, and the wheel's light and the pins' reach read
 * off the phase.
 *
 * **The wheel is never posed.** Its bearing is `wheelMilli`, drawn as it
 * stands every frame, so the turn is continuous because the hand is, and a
 * frozen wheel is still because the simulation stopped it — the stillness is
 * the tell, and nothing here could fake it.
 */

/** How far the drum tilts per pin out, in radians: the list that stands in for a health bar. */
const LIST = 0.11;
/** How much further than its neighbours the pin to be pulled hangs while frozen — THE TITHE's live plate. */
const LIVE_REACH = 1.55;

/** How far into its phase the drum is, in beats, the fraction of this one included. */
export function into(s: ValveState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** How many pins are out. */
export function pulled(s: ValveState): number {
  return VALVE_PINS - s.pins;
}

/** The drop into frame: 0 still above the field, 1 hung. Row 1 of the beat list. */
export function valveArrived(
  s: ValveState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.valveStillBeats));
}

/**
 * The list, in radians clockwise: one step per pin out, the latest eased in
 * over the list's beats — sealed, one, two, and three as the face falls.
 */
export function valveList(s: ValveState, cfg: SimConfig, beat: number, beatPhase: number): number {
  const out = pulled(s);
  if (s.phase !== "list") return LIST * out;
  const t = smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.valveListBeats));
  return LIST * (out - 1 + t);
}

/** How far the face has fallen open: 0 sealed, 1 split wide. Row 12. */
export function valveOpen(s: ValveState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "open") return 0;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.valveOpenBeats));
}

/** How lit the wheel is: dark while the drum settles, lit from the moment a mark lights (row 2). */
export function valveLit(s: ValveState): number {
  if (s.phase === "turn" || s.phase === "hold" || s.phase === "frozen") return 1;
  return 0.35;
}

/**
 * The socket's light: dim at rest, flashing on the beat while the wheel holds
 * on its mark (row 3), and glowing steady once the tap has frozen it (row 4).
 */
export function valveSocketGlow(s: ValveState, beatPhase: number): number {
  if (s.phase === "hold") return 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  if (s.phase === "frozen") return 1;
  return 0;
}

/** How far pin `i` hangs: the pin to be pulled reaches further while it may be, the rest at rest. */
export function valvePinReach(s: ValveState, i: number, beatPhase: number): number {
  if (s.phase !== "frozen" || i !== pulled(s)) return 1;
  return LIVE_REACH + 0.1 * Math.sin(beatPhase * Math.PI * 2);
}

/**
 * Pin `i`'s way out: -1 still in, 0 to 1 sliding free over the list after
 * its pull, and 2 gone, a hole where it was.
 */
export function valvePinOut(
  s: ValveState,
  cfg: SimConfig,
  i: number,
  beat: number,
  beatPhase: number,
): number {
  const out = pulled(s);
  if (i >= out) return -1;
  if (s.phase !== "list" || i !== out - 1) return 2;
  return smoothstep(into(s, beat, beatPhase) / Math.max(1, cfg.valveListBeats));
}
