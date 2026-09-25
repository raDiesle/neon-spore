import {
  type InstarMark,
  type InstarPose,
  type InstarState,
  instarStep,
  type SimConfig,
} from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { BEATEN, ENTER, POSES } from "./instar-poses.js";
import type { Layout } from "./layout.js";

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
 * **A pose is a figure, and a morph is a lerp.** Each of the five poses is
 * one `Figure` (`instar-poses.ts`); the body between two of them is the
 * straight blend, eased, over the part of the step's `morphBeats` the flight
 * takes (`instar-flight.ts`), so the body has its new pose by the time it
 * comes to rest and the marks glow up on it. While the marks are up the
 * figure is the pose's, **deformed by how far each mark has got** — each jaw
 * pushed shut as far as the thumb has pushed it, one egg fewer per tap and
 * per swipe, the fork pushed back with every tap. A morph starts from the
 * last pose *with its marks done*, so nothing opens again at the beat the
 * body begins to change.
 */

/** The part of a morph the flight takes (`instar-flight.ts`) and the pose's
 * blend with it; the rest is the body at rest, its marks glowing up
 * (`instar-marks.ts`). */
export const INSTAR_FLIGHT_ENDS = 0.6;

export interface Point {
  x: number;
  y: number;
}

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
}

/** The pose's figure after its marks are done: the parts the pair undid. */
function landed(pose: InstarPose, marks: readonly InstarMark[]): Figure {
  return deformed(POSES[pose], marks, () => 1);
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
    // An eye struck flinches shut by as much of its count as has landed.
    else if (m.part === "eye") g.wince = p;
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

/** The figure the body stands in this frame. */
export function instarFigure(s: InstarState, beat: number, beatPhase: number): Figure {
  const at = instarPhaseAt(s, beat, beatPhase);
  const step = instarStep(s);
  const prev = s.steps[s.cursor - 1];
  const from = prev === undefined ? ENTER : landed(prev.pose, prev.marks);
  if (s.phase === "down" || step === null) {
    // The last landing's figure sagging into the beaten one over the out beats.
    return lerp(from, BEATEN, smoothstep(at / 2));
  }
  if (s.phase === "morph") {
    const t = at / (step.morphBeats * INSTAR_FLIGHT_ENDS);
    return lerp(from, POSES[step.pose], smoothstep(Math.min(1, t)));
  }
  const pose = POSES[step.pose];
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

/** A place in thousandths of the field, in pixels. */
export function instarAt(l: Layout, xMilli: number, yMilli: number): Point {
  return {
    x: l.gridLeft + (xMilli * l.gridWidth) / 1000,
    y: l.gridTop + (yMilli * l.gridHeight) / 1000,
  };
}

/**
 * **Where THE INSTAR's body goes away to**: the far end of it, the root of
 * the tail. Seen face-on the body runs back and up into the dark above the
 * head, and side-on it is the end of the back. `slow-intake-aim.ts` stops
 * the slow's light along the line from here to the head, so the light stands
 * round the whole body rather than crossing it.
 */
export function instarFarEnd(l: Layout, f: Figure): Point {
  return instarAt(l, f.rearX, f.rearY);
}

/** A length in thousandths of the field's width, in pixels. */
export function instarLen(l: Layout, milli: number): number {
  return (milli * l.gridWidth) / 1000;
}

/** Where the head is drawn and how big, in pixels: the lunge thrusts it a
 * quarter larger at the ship. */
export function instarHeadAt(l: Layout, f: Figure): { head: Point; r: number } {
  return { head: instarAt(l, f.headX, f.headY), r: instarLen(l, f.headR) * (1 + 0.25 * f.reach) };
}

/**
 * Where a mark sits, in pixels — the script's own place for it, carried by
 * the frame's swing (`instar-sway.ts`).
 *
 * **The offset is asked for and never defaulted.** A caller that forgot it
 * would draw a ring where the body used to hang, or find a thumb on one, and
 * both failures are quiet: the ring is still a ring and the press is still a
 * press. Naming the two numbers at every call site is what makes a caller
 * that has not asked where the body swung to this frame say so out loud.
 */
export function instarMarkPoint(
  l: Layout,
  mark: InstarMark,
  sway: { xMilli: number; yMilli: number },
): Point {
  return instarAt(l, mark.xMilli + sway.xMilli, mark.yMilli + sway.yMilli);
}

/** A mark's radius in pixels: the handle's, the one size a thumb is asked for. */
export function instarMarkRadius(l: Layout, cfg: SimConfig): number {
  return (l.tile * cfg.handleRadiusMilli) / 1000;
}
