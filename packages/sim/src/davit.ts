import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE DAVIT: a crane boom pivoted off the hull's spine, steered by one seat's
 * held lean onto a lit column and loosed there by the other seat's draw, and
 * then a pivot that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §35).
 *
 * **The rule is one sentence**: one of you leans the boom onto the lit side
 * and keeps it there while the other holds a draw and looses it that way;
 * shoot the lit pivot in its colour.
 *
 * Each seat has a lean and a draw — the pilot's `davitSteerLeft` and
 * `davitLooseLeft`, the navigator's `davitSteerRight` and `davitLooseRight`.
 * A lean is THE PLUMB's reading (`LevelTilt`), a draw THE SLING's
 * (`DrawRelease`); what is new is that the lean is not judged on its own. A
 * step's `leanMilli` is where the boom must be steered, and the other seat's
 * draw only counts its beats while that lean is within `rangeMilli` of it,
 * and only lands if it lifts while the lean is still there, swiping toward
 * the half the lean points into. `aimMilli`, the boom itself, follows the
 * steering lean while it is in range and swings back toward hanging when it
 * is not.
 *
 * **Its health is the two swings of two looses each, and the three shots.**
 * A swing or a reland that runs out is tried again; a shot that runs out is a
 * hull hit, which is the wave.
 */

/** Looses that lock a swing — rows 2 and 3 of §35, and 4 and 5. */
export const DAVIT_LOOSES_PER_SWING = 2;

/**
 * A seat's lean before its phone has said anything, or after it stopped:
 * further off any target than a phone can lean, so no range ever holds it.
 */
export const DAVIT_UNREAD = 1_000_000;

/**
 * Where the scene is: settling, a step lit and waiting, the boom resting
 * between steps, and the boom swung hard over, spent.
 */
export const DAVIT_PHASES = ["still", "lit", "rest", "spent"] as const;
export type DavitPhase = (typeof DAVIT_PHASES)[number];

/**
 * What a step asks: the left swing (the pilot steers, the navigator looses),
 * the right swing (the other way about), a shot at the pivot, or a reland —
 * either seat looses against the other's lean.
 */
export const DAVIT_ASKS = ["left", "right", "fire", "reland"] as const;
export type DavitAsk = (typeof DAVIT_ASKS)[number];

/** Which half a lean points into, and so which way a loose must swipe. */
export type DavitHalf = "left" | "right";

/** One step of the script, authored on the wave. */
export interface DavitStep {
  ask: DavitAsk;
  /**
   * Where the boom must be steered, thousandths of a degree of lean: below
   * nought the left half, the rest the right. Only a swing or a reland reads it.
   */
  leanMilli: number;
  /** How far off `leanMilli` still counts as steered. Only a swing or a reland reads it. */
  rangeMilli: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats: how long a draw must be held steered, how long a fire step waits for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface DavitEntry {
  kind: "davit";
  steps: readonly DavitStep[];
}

export interface DavitState {
  kind: "davit";
  /** Copied at install and never written again. */
  steps: DavitStep[];
  phase: DavitPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Looses landed on each swing, the left then the right: nought up to `DAVIT_LOOSES_PER_SWING`. */
  swings: [number, number];
  /** Shots the pivot has taken. */
  hits: number;
  /** Whether the pivot is lit to be shot. */
  pivotLit: boolean;
  /** Each seat's lean, thousandths of a degree, or `DAVIT_UNREAD`. */
  tiltMilli: [number, number];
  /** Whether each seat's finger is down on its draw this instant. */
  holding: [boolean, boolean];
  /** Beats each seat has held its draw steered in the lit step, up to the step's `beats`. */
  drawnBeats: [number, number];
  /** Where the boom points, thousandths of a degree: the steering lean, or swinging back to nought. */
  aimMilli: number;
}

export function davitBoss(world: World): DavitState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "davit" ? boss : null;
}

/** The step lit, or null between steps. */
export function davitLitStep(s: DavitState): DavitStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The half a lean points into. */
export function davitHalf(leanMilli: number): DavitHalf {
  return leanMilli < 0 ? "left" : "right";
}

/** The side a swipe went, from its signed `fromMilli`, or null for a lift with no swipe. */
export function davitSwipe(fromMilli: number): DavitHalf | null {
  if (fromMilli < 0) return "left";
  if (fromMilli > 0) return "right";
  return null;
}

/** Whether the lit step asks this seat to draw: the navigator on the left swing, the pilot on the right, either on a reland. */
export function davitDraws(s: DavitState, side: 0 | 1): boolean {
  const ask = davitLitStep(s)?.ask;
  if (ask === "reland") return true;
  return ask === (side === 0 ? "right" : "left");
}

/** Whether the lit step lets this seat steer. */
export function davitSteers(s: DavitState, side: 0 | 1): boolean {
  const ask = davitLitStep(s)?.ask;
  if (ask === "reland") return true;
  return ask === (side === 0 ? "left" : "right");
}

/** Whether this seat's lean holds the lit step's target, whether or not the step lets it steer. */
export function davitOnTarget(s: DavitState, side: 0 | 1): boolean {
  const step = davitLitStep(s);
  if (step === null || step.ask === "fire") return false;
  return Math.abs(s.tiltMilli[side] - step.leanMilli) <= step.rangeMilli;
}

/** Whether a draw by this seat is steered: the other seat steers the lit step and holds its target. */
export function davitSteered(s: DavitState, drawer: 0 | 1): boolean {
  const steer: 0 | 1 = drawer === 0 ? 1 : 0;
  return davitSteers(s, steer) && davitOnTarget(s, steer);
}

/** The seat whose lean the boom is following this instant, or null when it swings free. */
export function davitSteering(s: DavitState): 0 | 1 | null {
  for (const side of [0, 1] as const) {
    if (davitSteers(s, side) && davitOnTarget(s, side)) return side;
  }
  return null;
}

/** The boom swung hard over: the fight is over and it is only hanging there. */
export function davitDone(s: DavitState): boolean {
  return s.phase === "spent";
}

/** A fresh boom: both swings empty, the pivot dark, no lean read, no finger down. */
export function freshDavit(beat: number, steps: readonly DavitStep[]): DavitState {
  return {
    kind: "davit",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    swings: [0, 0],
    hits: 0,
    pivotLit: false,
    tiltMilli: [DAVIT_UNREAD, DAVIT_UNREAD],
    holding: [false, false],
    drawnBeats: [0, 0],
    aimMilli: 0,
  };
}
