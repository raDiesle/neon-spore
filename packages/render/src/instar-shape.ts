import {
  type InstarMark,
  type InstarPose,
  type InstarState,
  instarStep,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { BEATEN, ENTER, placed } from "./instar-poses.js";

/**
 * **Where THE INSTAR is**, as one figure of numbers: the head and its two
 * jaws, the eyes, how far the body has turned side-on, the wings, the far end
 * of the body, the two nests on its back, the tail's fork — every one a place
 * in thousandths of the field, the same grid the script's marks are written
 * in (`packages/content/src/instar-script.ts`), so a mark on a jaw sits on
 * the jaw because the jaw is drawn *at the mark*.
 *
 * Its own file for THE HIVE's reason (`hive-shape.ts`): the drawer stands
 * the body on these (`instar-draw.ts`, `instar-head.ts`,
 * `instar-profile.ts`), the marks are drawn at them (`instar-marks.ts`) and
 * the transients throw their bursts at them (`instar-fx.ts`). Everything
 * here is a pure function of the state and the beat, and **nothing here is
 * per seat**: both screens see the same body, and the split of this boss is
 * in whose thumb each mark wants.
 *
 * **A pose is a figure, and a morph is a lerp.** Each of the poses is
 * one `Figure` (`instar-poses.ts`); the body between two of them is the
 * straight blend, eased, over the part of the step's `morphBeats` the flight
 * takes (`instar-flight.ts`), so the body has its new pose by the time it
 * comes to rest and the marks glow up on it. While the marks are up the
 * figure is the pose's, **deformed by how far each mark has got** — each jaw
 * pushed shut as far as the thumb has pushed it, one egg fewer per tap and
 * per swipe, the fork pushed back with every tap, a strip of the hide per swipe. A morph starts from the
 * last pose *with its marks done*, so nothing opens again at the beat the
 * body begins to change.
 *
 * This file is the figure's arithmetic; the figure turned into pixels — where
 * a place, the head, the far end and a mark are drawn — is `instar-place.ts`.
 */

/** The part of a morph the flight takes (`instar-flight.ts`) and the pose's
 * blend with it; the rest is the body at rest, its marks glowing up
 * (`instar-marks.ts`). */
export const INSTAR_FLIGHT_ENDS = 0.6;

export interface Figure {
  /** The head's centre and radius, thousandths of the field's width. */
  headX: number;
  headY: number;
  headR: number;
  /** How far the upper and the lower jaw stand off the bite, 0..1. */
  jawUp: number;
  jawDown: number;
  /** How open the eyes are, 0..1. */
  eye: number;
  /** How far the right eye is struck shut, 0..1, on top of `eye`: the split
   * lunge's taps, one flinch each. */
  wince: number;
  /** The left eye's, the same way: the glare's bolts strike each eye by its
   * own count (§11.32's second act). */
  winceLeft: number;
  /** How far the body has turned side-on, 0..1: 0 is the face at the ship,
   * 1 the dragon in profile, head to the left, back up, tail out behind. */
  side: number;
  /** How far the wings are spread, 0..1. */
  wing: number;
  /** The far end of the body — the root of the tail, where the engines burn. */
  rearX: number;
  rearY: number;
  /** The nest a swipe clears, 0..1 of its eggs, and where it sits on the back. */
  eggs: number;
  eggsX: number;
  eggsY: number;
  /** The nest a tap squashes, 0..1 of its eggs, and where. */
  nest: number;
  nestX: number;
  nestY: number;
  /** How far the tail's fork is over the hull, 0..1, and where its fork stands. */
  tail: number;
  tailX: number;
  tailY: number;
  /** The lunge: how far the head is thrust at the ship, 0..1. */
  reach: number;
  /** How much of the fire in the mouth is still burning, 0..1: tapped out
   * by a mark on it, lit again when the next bite comes. */
  flame: number;
  /** The moult: how wide the hide stands split along the back, 0..1, and how
   * much of each half is swiped off it — the half by the head, the one by the rear. */
  split: number;
  shedNear: number;
  shedFar: number;
  /** The bare body's heart lit through the split, 0..1, put out by the
   * bolts on it. */
  heart: number;
}

/** The pose's figure after its marks are done: the parts the pair undid. */
function landed(pose: InstarPose, marks: readonly InstarMark[]): Figure {
  return deformed(placed(pose, marks), marks, () => 1);
}

/** One mark's part moved by how far along it is, 0..1. */
export function deformed(
  f: Figure,
  marks: readonly InstarMark[],
  along: (i: number) => number,
): Figure {
  const g = { ...f };
  const tails = marks.filter((m) => m.part === "tail").length;
  marks.forEach((m, i) => {
    const p = Math.max(0, Math.min(1, along(i)));
    // A jaw is pushed shut: the upper one down, the lower one up.
    if (m.part === "jaw") {
      if (m.gesture === "pullDown") g.jawUp = f.jawUp * (1 - p);
      else g.jawDown = f.jawDown * (1 - p);
    } else if (m.part === "eggs") {
      // A tap squashes an egg where it lies; a swipe drags one off its nest.
      if (m.gesture === "tap") g.nest = f.nest * (1 - p);
      else g.eggs = f.eggs * (1 - p);
    }
    // The fork is one tail: every thumb on it pushes its share of it back.
    else if (m.part === "tail") g.tail -= (f.tail * p) / tails;
    else if (m.part === "head") g.reach = f.reach * (1 - p);
    // An eye struck flinches shut by as much of its count as has landed,
    // each eye by the mark on its own side.
    else if (m.part === "eye") g[m.xMilli < 500 ? "winceLeft" : "wince"] = p;
    // The fire in the mouth is tapped out by as much of its count as has landed.
    else if (m.part === "fire") g.flame = f.flame * (1 - p);
    // A strip of the old hide off its half per counted swipe.
    else if (m.part === "hide") g[m.xMilli < 500 ? "shedNear" : "shedFar"] = p;
    // The heart put out by as much of its count as has landed.
    else if (m.part === "heart") g.heart = f.heart * (1 - p);
  });
  return g;
}

function lerp(a: Figure, b: Figure, t: number): Figure {
  const out = { ...a };
  for (const k of Object.keys(a) as (keyof Figure)[]) out[k] = a[k] + (b[k] - a[k]) * t;
  return out;
}

/** How far into the phase the frame is, in beats, sub-beat included. */
export function instarPhaseAt(s: InstarState, beat: number, beatPhase: number): number {
  return Math.max(0, beat - s.phaseBeat + beatPhase);
}

/**
 * The figure the body stands in this frame. `held` is how far the window had
 * run when the step landed (`InstarFx`): a swept blade eases back from there
 * over the landing rather than being where it started on the landing tick.
 */
export function instarFigure(s: InstarState, beat: number, beatPhase: number, held = 0): Figure {
  const at = instarPhaseAt(s, beat, beatPhase);
  const step = instarStep(s);
  const prev = s.steps[s.cursor - 1];
  const from = prev === undefined ? ENTER : landed(prev.pose, prev.marks);
  if (s.phase === "down" || step === null) {
    // The last landing's figure sagging into the beaten one over the out
    // beats, in whatever of the new body it has shed into.
    const { split, shedNear, shedFar } = from;
    return lerp(from, { ...BEATEN, split, shedNear, shedFar }, smoothstep(at / 2));
  }
  if (s.phase === "morph") {
    const t = at / (step.morphBeats * INSTAR_FLIGHT_ENDS);
    return lerp(from, placed(step.pose, step.marks), smoothstep(Math.min(1, t)));
  }
  const along =
    s.phase === "land"
      ? held * (1 - smoothstep(at / step.landBeats))
      : instarThreat(s, beat, beatPhase);
  const pose = placed(step.pose, step.marks, along);
  return deformed(pose, step.marks, (i) => {
    const need = step.marks[i]?.need ?? 1;
    return (s.progress[i] ?? 0) / need;
  });
}

/** How far the morph has come, 0..1 — 1 outside a morph. The marks are shown
 * growing out of their parts over the last of it (`instar-marks.ts`). */
export function instarMorphAt(s: InstarState, beat: number, beatPhase: number): number {
  const step = instarStep(s);
  if (s.phase !== "morph" || step === null) return 1;
  return Math.min(1, instarPhaseAt(s, beat, beatPhase) / step.morphBeats);
}

/** How far the window has run, 0..1 — nought outside it. What the pair are
 * defending against grows by it: the fire in the mouth, the eggs' rumble,
 * the fork's wind-up (`instar-draw.ts`). */
export function instarThreat(s: InstarState, beat: number, beatPhase: number): number {
  const step = instarStep(s);
  if (s.phase !== "act" || step === null) return 0;
  return Math.min(1, instarPhaseAt(s, beat, beatPhase) / step.windowBeats);
}

/** The body's opacity: whole until the last landing, then gone over `instarOutBeats`. */
export function instarFade(
  s: InstarState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (s.phase !== "down") return 1;
  return Math.max(0, 1 - instarPhaseAt(s, beat, beatPhase) / cfg.instarOutBeats);
}
