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
 * **Where THE INSTAR is**, as one figure of numbers: the head, the jaws, the
 * two hands and what they hold, the clutch of eggs, the tongue, the tail —
 * every one a place in thousandths of the field, the same grid the script's
 * marks are written in (`packages/content/src/instar-script.ts`), so a mark
 * on a hand sits on the hand because the hand is drawn *at the mark*.
 *
 * Its own file for THE HIVE's reason (`hive-shape.ts`): the drawer stands
 * the body on these (`instar-draw.ts`, `instar-limbs.ts`), the marks are
 * drawn at them (`instar-marks.ts`) and the transients throw their bursts
 * at them (`instar-fx.ts`). Everything here is a pure function of the state
 * and the beat, and **nothing here is per seat**: both screens see the same
 * body, and the split of this boss is in whose thumb each mark wants.
 *
 * **A pose is a figure, and a morph is a lerp.** Each of the five poses is
 * one `Figure` below; the body between two of them is the straight blend,
 * eased, over the step's `morphBeats`. While the marks are up the figure is
 * the pose's, **deformed by how far each mark has got** — the jaw at the
 * depth the thumb has pulled it, the club slipping from a hand slapped four
 * times of six, one egg fewer per swipe, the tongue winding in with the
 * turn, the tail lifting with the pull, the head pushed back with the hold.
 * A morph starts from the last pose *with its marks done*, so nothing snaps
 * back into the hand at the beat the body begins to change.
 */

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
  /** How far the body has turned its back, 0..1: the eyes go, the tail is out. */
  back: number;
  /** The two hands, and how firmly each holds its club, 0..1. */
  lHandX: number;
  lHandY: number;
  lWeapon: number;
  rHandX: number;
  rHandY: number;
  rWeapon: number;
  /** How much of the clutch is on the flank, 0..1, and where. */
  eggs: number;
  eggsX: number;
  eggsY: number;
  /** How far the tongue is out, 0..1, and where its tip coils. */
  tongue: number;
  tongueX: number;
  tongueY: number;
  /** How far the tail is over the hull, 0..1, and where its barb hangs. */
  tail: number;
  tailX: number;
  tailY: number;
  /** The lunge: how far the head is thrust at the ship, 0..1. */
  reach: number;
  /** The moult: how much of the shed husk still hangs off the body, 0..1. */
  slough: number;
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
  marks.forEach((m, i) => {
    const p = Math.max(0, Math.min(1, along(i)));
    if (m.part === "jaw") {
      if (m.gesture === "pullUp") g.jawUp = Math.max(g.jawUp, p);
      else g.jawDown = Math.max(g.jawDown, p);
    } else if (m.part === "hand") {
      if (m.xMilli < 500) g.lWeapon = f.lWeapon * (1 - p);
      else g.rWeapon = f.rWeapon * (1 - p);
    } else if (m.part === "eggs") g.eggs = f.eggs * (1 - p);
    else if (m.part === "tongue") g.tongue = f.tongue * (1 - p);
    else if (m.part === "tail") g.tail = f.tail * (1 - p);
    else if (m.part === "head") g.reach = f.reach * (1 - p);
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
  if (s.phase === "morph") return lerp(from, POSES[step.pose], smoothstep(at / step.morphBeats));
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
 * **Where THE INSTAR's chain leaves the frame**: above the middle of the
 * grid, a tile and a bit over its top edge. `drawInstarChain` hangs the four
 * plates from here and `slow-intake-aim.ts` keeps the light off the whole
 * body along the same line, so the chain is re-hung here or not at all.
 */
export function instarChainTop(l: Layout): Point {
  return { x: instarAt(l, 500, 0).x, y: l.gridTop - l.tile * 1.3 };
}

/** A length in thousandths of the field's width, in pixels. */
export function instarLen(l: Layout, milli: number): number {
  return (milli * l.gridWidth) / 1000;
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
