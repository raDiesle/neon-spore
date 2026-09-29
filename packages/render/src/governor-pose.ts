import {
  GOVERNOR_TURN_MILLI,
  type GovernorState,
  governorGovernor,
  governorLitStep,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE GOVERNOR is posed off** (§43, *Animation*), five poses:
 * the flyweights slow and the needle idling; loose and the needle
 * sprinting; a chord replanted and the needle easing; the dial tipped up to
 * the hub while a shot is owed; and the flyweights flown wide for good, the
 * needle stalled.
 *
 * **The speed is drawn as the flyweights' height and nothing else**: the
 * arms' swing off the spindle is read straight off `speedMilli`, which the
 * simulation eases and climbs a tick at a time, so the weights rise as a
 * pad lifts and sink as the chord is made whole with no easing of their own
 * — the picture is exactly as late as the needle. **Their place round the
 * spindle is the needle's**, a whole number of turns to its one, so they
 * turn exactly as fast as it does, stop when it stalls, and stand the same
 * on both phones.
 */

/** The arms' swing off the spindle, in radians: hanging at 1×, out at the hottest, flat out once spent. */
const SWING_SLOW = 0.42;
const SWING_HOT = 1.05;
const SWING_WIDE = 1.42;
/** The flyweights' turns to one of the needle's. */
const ORBITS = 3;
/** The eye's height as a sine: over the dial while it is read, and risen over the hub while it is shot. */
export const TILT_READ = 0.56;
export const TILT_HUB = 0.84;

/** The governor lowered onto the field as it arrives: 0 above it, 1 in place. */
export function governorArrived(
  s: GovernorState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "slack" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.governorSlackBeats));
}

/** How hot the needle runs, 0 at 1× and 1 at `governorHotMilli`. */
export function governorHeat(s: GovernorState, cfg: SimConfig): number {
  const span = Math.max(1, cfg.governorHotMilli - 1000);
  return Math.min(1, Math.max(0, (s.speedMilli - 1000) / span));
}

/** The flyweights' swing off the spindle this frame, in radians. */
export function governorSwing(
  s: GovernorState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const running = SWING_SLOW + (SWING_HOT - SWING_SLOW) * governorHeat(s, cfg);
  return running + (SWING_WIDE - running) * governorSpent(s, cfg, beat, beatPhase);
}

/** The first flyweight's place round the spindle, in radians; the second is opposite it. */
export function governorOrbit(s: GovernorState): number {
  return (s.needleMilli / GOVERNOR_TURN_MILLI) * Math.PI * 2 * ORBITS;
}

/**
 * How far the eye has risen over the hub, 0 reading the dial and 1 looking
 * down on it: up across a fire step's first beat, and back down across the
 * rest after it. A shot is aimed at the hub, and a dial tipped up to it is
 * the body presenting it.
 */
export function governorTipped(s: GovernorState, beat: number, beatPhase: number): number {
  const into = phaseInto(s, beat, beatPhase);
  if (governorLitStep(s)?.ask === "fire") return smoothstep(Math.min(1, into));
  if (s.phase === "rest" && s.steps[s.cursor - 1]?.ask === "fire") {
    return 1 - smoothstep(Math.min(1, into));
  }
  return 0;
}

/** The eye's height as a sine for this frame. */
export function governorTilt(s: GovernorState, beat: number, beatPhase: number): number {
  return TILT_READ + (TILT_HUB - TILT_READ) * governorTipped(s, beat, beatPhase);
}

/** How much of the lit step is still to run, 1 as it lights and 0 when it is out. */
export function governorLeft(s: GovernorState, beat: number, beatPhase: number): number {
  const step = governorLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - phaseInto(s, beat, beatPhase) / Math.max(1, step.beats));
}

/** How far the spent governor has run down, 0 not spent and 1 still. */
export function governorSpent(
  s: GovernorState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "spent") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.governorSpentBeats));
}

/**
 * The pads the lit step's braking seat holds down, as its mask, or null
 * while nobody is asked to brake — the yoke then hangs half open.
 */
export function governorJaws(s: GovernorState): number | null {
  const seat = governorGovernor(s);
  return seat === null ? null : (s.padsDown[seat - 1] ?? 0);
}
