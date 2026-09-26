import {
  PLUMB_SETTLES_PER_WEIGHT,
  PLUMB_UNREAD,
  type PlumbState,
  plumbLitStep,
  plumbTrue,
  plumbWindowBeats,
  type World,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";

/**
 * **The clock THE PLUMB is posed off** (§31, *Animation*): hanging lopsided;
 * a weight coming true under a steady phone; both true and the bob turned to
 * show its core; the core held against the weights creeping off; and the bob
 * swinging free — each read straight off the world, since the settles, the
 * held beats and both phones' leans are numbers the simulation already keeps.
 *
 * **Progress is the tilt.** The beam hangs off level by what is still owed —
 * the four settles, less the share of the lit one already held — so a thumb
 * holding its phone still is seen bringing the beam up, and a drift, which
 * starts the count again, is seen letting it fall back.
 */

/** The beam's lean with nothing settled, in radians: the pilot's heavier ball pulls its end down. */
const SKEW = 0.2;
/** A loose weight's swing on its chain, in radians, and how fast it swings. */
const LOOSE = 0.32;
const SWING_RATE = 2.1;
/** How far a read phone's lean pushes its own weight over, in radians, at the vial's end. */
const LEAN = 0.18;
/** How far both weights sway off true as a `both` step's window runs out unheld. */
const CREEP = 0.22;
/** A phone's lean at the vial's end, thousandths of a degree. */
export const PLUMB_VIAL_MILLI = 20_000;

/** How far into its phase the bob is, in beats, the fraction of this one included. */
export function into(s: PlumbState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/** The drop into frame: 0 still above the field, 1 hanging. */
export function plumbArrived(s: PlumbState, world: World, beat: number, bp: number): number {
  if (s.phase !== "still") return 1;
  return smoothstep(into(s, beat, bp) / Math.max(1, world.cfg.plumbStillBeats));
}

/** How far the bob has fallen away: 0 hanging, 1 gone. */
export function plumbFree(s: PlumbState, world: World, beat: number, bp: number): number {
  if (s.phase !== "free") return 0;
  return smoothstep(into(s, beat, bp) / Math.max(1, world.cfg.plumbFreeBeats));
}

/** How much of the lit step's window is left: 1 as it lights, 0 as it runs out. */
export function plumbLeft(s: PlumbState, world: World, beat: number, bp: number): number {
  const step = plumbLitStep(s);
  if (step === null) return 0;
  return Math.max(0, 1 - into(s, beat, bp) / Math.max(1, plumbWindowBeats(world, step)));
}

/**
 * How much of the lit level step is held: the beats counted, and this one's
 * share while the lean is inside the range — 0 the moment a phone drifts,
 * which is when the simulation starts the count again.
 */
export function plumbHeld(s: PlumbState, bp: number): number {
  const step = plumbLitStep(s);
  if (step === null || step.ask === "fire") return 0;
  const now = plumbTrue(s) ? bp : 0;
  return Math.min(1, (s.heldBeats + now) / Math.max(1, step.beats));
}

/** Whether side `side`'s phone is what the lit step asks to be level. */
export function plumbAsked(s: PlumbState, side: 0 | 1): boolean {
  const ask = plumbLitStep(s)?.ask;
  return ask === "both" || ask === (side === 0 ? "left" : "right");
}

/**
 * The beam's lean about the hook, radians: `-SKEW` hanging lopsided, 0 plumb.
 * Four settles bring it up, a quarter each, and the lit one's held share is
 * part of its quarter — so a settle is the end of a rise, never a jump.
 */
export function plumbSkew(s: PlumbState, bp: number): number {
  const owed = PLUMB_SETTLES_PER_WEIGHT * 2;
  const ask = plumbLitStep(s)?.ask;
  const rising = ask === "left" || ask === "right" ? plumbHeld(s, bp) : 0;
  const done = Math.min(owed, s.weights[0] + s.weights[1] + rising);
  return -SKEW * (1 - done / owed);
}

/**
 * Weight `side`'s chain off the field's down, radians. A loose weight swings,
 * less for every settle and less again for the share of its step held; a
 * locked one hangs still. While its phone is read and asked, it leans the way
 * the phone does, so the seat sees its own hand on it; and through a `both`
 * step both sway back off true as the window runs out unheld.
 */
export function plumbSwing(
  s: PlumbState,
  world: World,
  side: 0 | 1,
  beat: number,
  bp: number,
  time: number,
): number {
  const loose = 1 - Math.min(PLUMB_SETTLES_PER_WEIGHT, s.weights[side]) / PLUMB_SETTLES_PER_WEIGHT;
  const asked = plumbAsked(s, side);
  const held = plumbHeld(s, bp);
  let amp = LOOSE * loose * (asked ? 1 - held : 1);
  if (plumbLitStep(s)?.ask === "both") {
    amp += CREEP * (1 - plumbLeft(s, world, beat, bp)) * (1 - held);
  }
  const tilt = s.tiltMilli[side];
  const lean =
    asked && tilt !== PLUMB_UNREAD ? LEAN * Math.max(-1, Math.min(1, tilt / PLUMB_VIAL_MILLI)) : 0;
  return amp * Math.sin(time * SWING_RATE + side * 1.9) + lean;
}

/**
 * How far the bob has turned to face the pair, 0 edge-on to 1 face-on
 * (§31, *Perspective*). It hangs turned away, its core out of sight, until
 * both weights are true; turns through the rest after the settle that lit it;
 * and turns away through the rest after a `both` step let it dim. A `both`
 * step with the core dark turns it as far as the step is held.
 */
export function plumbTurn(s: PlumbState, world: World, beat: number, bp: number): number {
  const rest = s.phase === "rest";
  const ease = smoothstep(into(s, beat, bp) / Math.max(1, world.cfg.plumbRestBeats));
  const before = s.steps[s.cursor - 1]?.ask;
  if (s.coreLit) return rest && (before === "left" || before === "right") ? ease : 1;
  if (rest && s.steps[s.cursor]?.ask === "both") return 1 - ease;
  if (plumbLitStep(s)?.ask === "both") return plumbHeld(s, bp);
  return 0;
}
