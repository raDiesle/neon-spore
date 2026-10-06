import {
  GOVERNOR_TURN_MILLI,
  type GovernorState,
  governorDone,
  governorLitStep,
  governorPace,
  type SimConfig,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { type Dial, governorDial } from "./governor-shape.js";
import type { Layout } from "./layout.js";
import { phaseInto } from "./phase-into.js";

/**
 * **The clock THE GOVERNOR is posed off** (§43, *Animation*), four poses:
 * the flyweights low and the needle idling; flown up with a quick step's
 * needle; the dial tipped up to the hub while a shot is owed; and the
 * flyweights flown wide for good, the needle stalled.
 *
 * **The pace is drawn as the flyweights' height and nothing else**: the
 * arms' swing off the spindle is read straight off the lit step's pace.
 * **Their place round the spindle is the needle's**, a whole number of turns
 * to its one, so they turn exactly as fast as it does, stop when it stalls,
 * and stand the same on both phones.
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

/** How far above its place the governor starts as it is lowered in, in tiles. */
const ARRIVE = 3;

/**
 * The dial where it stands this frame: tipped to this frame's eye and
 * lowered by the arrival, so what a thumb is answered on and what a word
 * stands on are the dial `drawGovernor` draws.
 */
export function governorStanding(
  l: Layout,
  cfg: SimConfig,
  s: GovernorState,
  beat: number,
  beatPhase: number,
): Dial {
  const d = governorDial(l, cfg, governorTilt(s, beat, beatPhase));
  const lowered = (1 - governorArrived(s, cfg, beat, beatPhase)) * ARRIVE * l.tile;
  return { ...d, cy: d.cy - lowered };
}

/** The pace over the idle one at which the flyweights fly their highest, thousandths of a turn a tick. */
const HOT_OVER = 6;

/** How quick the needle runs, 0 at the idle pace and 1 at `HOT_OVER` over it. */
export function governorHeat(s: GovernorState, cfg: SimConfig): number {
  const pace = governorLitStep(s)?.paceMilli ?? cfg.governorIdleMilli;
  return Math.min(1, Math.max(0, (pace - cfg.governorIdleMilli) / HOT_OVER));
}

/**
 * Where the needle is drawn: `lead` ticks of its pace ahead of the
 * simulation, so a thumb that taps as it sees the needle on a mark is heard
 * with the needle on it (`governor-draw.ts`). Spent, it stands where it
 * stalled.
 */
export function governorNeedleShown(world: World, s: GovernorState, lead: number): number {
  if (governorDone(s)) return s.needleMilli;
  return (s.needleMilli + governorPace(world, s) * lead) % GOVERNOR_TURN_MILLI;
}

/** How many marks each seat is owed over the whole script: its studs. */
export function governorOwed(s: GovernorState): [number, number] {
  const owed: [number, number] = [0, 0];
  for (const step of s.steps) {
    for (const mark of step.marks) owed[mark.seat === 1 ? 0 : 1] += 1;
  }
  return owed;
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

/** The first flyweight's place round the spindle for a needle at `needleMilli`, in radians; the second is opposite it. */
export function governorOrbit(needleMilli: number): number {
  return (needleMilli / GOVERNOR_TURN_MILLI) * Math.PI * 2 * ORBITS;
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
