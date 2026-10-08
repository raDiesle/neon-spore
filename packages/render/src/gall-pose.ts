import { type GallState, gallLitStep, gallPresser, type SimConfig } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { phaseInto } from "./phase-into.js";
import { NO_SPAN, type SlowSpan, slowHush } from "./slow-hush.js";

/**
 * **The clock THE GALL is posed off** (§38, *Animation*): dropping onto the
 * seam as it settles in; wound tighter by every tap of a leap step, and
 * shivering once it is charged; in the air along its arc through a leap; a
 * lobe fewer and smaller for every shot; and dropping dead as the script
 * ends — each read straight off the world, since the taps, the point it left
 * and the beat it left on are numbers the simulation keeps.
 */

/** Lobes on an alien nobody has shot yet: NOTCH 2's own count. */
const LOBES = 5;
/** How much smaller a shot leaves it. */
const SPENT = 0.16;

/** The drop onto the seam: 0 still above it, 1 standing. */
export function gallArrived(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "slack" || s.cursor > 0) return 1;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.gallSlackBeats));
}

/** How far it has dropped dead, shot down: 0 standing, 1 gone. */
export function gallFlat(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase !== "flat") return 0;
  return smoothstep(phaseInto(s, beat, beatPhase) / Math.max(1, cfg.gallFlatBeats));
}

/** How far a leap step's taps have wound it: 0 untapped or no leap lit, 1 charged. */
export function gallCharge(s: GallState): number {
  const step = gallLitStep(s);
  if (step?.ask !== "leap") return 0;
  return step.taps <= 0 ? 1 : Math.min(1, s.taps / step.taps);
}

/** How far through its leap it is, 0 as it leaves and 1 as it lands; null on the ground. */
export function gallFlight(
  s: GallState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number | null {
  if (s.phase !== "leap") return null;
  return Math.min(1, phaseInto(s, beat, beatPhase) / Math.max(1, cfg.gallLeapBeats));
}

/** Its lobes: NOTCH 2's five, one fewer for every shot, never under two. */
export function gallLobes(s: Pick<GallState, "hits">): number {
  return Math.max(2, LOBES - s.hits);
}

/** Its size: its fullest, a sixth smaller for every shot. */
export function gallSpent(s: Pick<GallState, "hits">): number {
  return 1 - SPENT * Math.min(3, s.hits);
}

/**
 * How hard the seam ripples: once standing, more as it drops in and as it
 * leaps off, and dying away as it drops dead. It carries both rings, so it
 * dies down under `slow` too (`slow-hush.ts`).
 */
export function gallRippling(
  s: GallState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
  slow: SlowSpan = NO_SPAN,
): number {
  return rippling(s, cfg, beat, beatPhase) * slowHush(slow, beat, beatPhase);
}

function rippling(s: GallState, cfg: SimConfig, beat: number, beatPhase: number): number {
  if (s.phase === "flat") return 1 - gallFlat(s, cfg, beat, beatPhase);
  if (s.phase === "leap") return 1.8;
  if (s.phase === "slack") return 1.3;
  return 1;
}

/** The breath on its beat while a step is lit, and a shiver once it is charged. */
export function gallSwell(s: GallState, beatPhase: number, time: number): number {
  if (gallLitStep(s) === null) return 1;
  const breath = 0.5 + 0.5 * Math.cos(beatPhase * Math.PI * 2);
  const shiver = gallCharge(s) >= 1 ? 0.04 * Math.sin(time * 40) : 0;
  return 1 + 0.06 * breath + shiver;
}

/**
 * Which way it heels, in radians: toward the end of the field whose seat's
 * half it is on — π the left, the pilot's, nought the right — turned over
 * with the field under THE FLIP so it leans the way it is drawn.
 */
export function gallBearing(s: GallState, flip: boolean): number {
  const left = gallPresser(s) === 1;
  return left !== flip ? Math.PI : 0;
}
