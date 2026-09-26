import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE PLUMB: a lopsided bob hung off the hull over the middle column, its two
 * counterweights each brought level by one seat holding the phone itself
 * level, and then a core that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §31).
 *
 * **The rule is one sentence**: hold your phone level until your weight hangs
 * true, then shoot the lit core in its colour.
 *
 * Each seat has one weight — the pilot's `plumbLevelLeft`, the navigator's
 * `plumbLevelRight` — and reports its phone's lean on it, thousandths of a
 * degree off level (`LevelTilt`, §31's primitive). A level step counts the
 * beats that lean stays inside the step's `rangeMilli` (for `both`, both
 * seats' leans); drifting out starts the count again. Two settles lock a
 * weight plumb, both weights plumb light the core, and after that the script
 * alternates a shot at the core with both seats levelling to hold it.
 *
 * **Its health is the four settles and the three shots.** A level that runs
 * out is tried again; a shot that runs out is a hull hit, which is the wave.
 */

/** Settles that lock a weight plumb — rows 2 and 3 of §31, and 4 and 5. */
export const PLUMB_SETTLES_PER_WEIGHT = 2;

/**
 * A seat's lean before its phone has said anything, or after it stopped:
 * further off level than any phone can lean, so no range ever holds it.
 */
export const PLUMB_UNREAD = 1_000_000;

/**
 * Where the scene is: settling, a step lit and waiting, the bob resting
 * between steps, and the bob swinging free.
 */
export const PLUMB_PHASES = ["still", "lit", "rest", "free"] as const;
export type PlumbPhase = (typeof PLUMB_PHASES)[number];

/**
 * What a step asks: the pilot's phone level for the left weight, the
 * navigator's for the right, a shot at the core, or both phones level at
 * once to hold the weights true under it.
 */
export const PLUMB_ASKS = ["left", "right", "fire", "both"] as const;
export type PlumbAsk = (typeof PLUMB_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface PlumbStep {
  ask: PlumbAsk;
  /** How far off level still counts, thousandths of a degree. Only a level step reads it. */
  rangeMilli: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /**
   * Beats: how long a lean must be held, how long a fire step waits for its
   * shot.
   */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface PlumbEntry {
  kind: "plumb";
  steps: readonly PlumbStep[];
}

export interface PlumbState {
  kind: "plumb";
  /** Copied at install and never written again. */
  steps: PlumbStep[];
  phase: PlumbPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Settles on each weight, the pilot's then the navigator's: nought up to `PLUMB_SETTLES_PER_WEIGHT`. */
  weights: [number, number];
  /** Shots the core has taken. */
  hits: number;
  /** Whether the core is lit and held true to be shot. */
  coreLit: boolean;
  /** Each seat's lean this instant, thousandths of a degree, or `PLUMB_UNREAD`. */
  tiltMilli: [number, number];
  /** Beats of the lit level step its lean(s) have been held. */
  heldBeats: number;
}

export function plumbBoss(world: World): PlumbState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "plumb" ? boss : null;
}

/** The step lit, or null between steps. */
export function plumbLitStep(s: PlumbState): PlumbStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step is a level: one weight, or both. */
export function levelling(s: PlumbState): boolean {
  const ask = plumbLitStep(s)?.ask;
  return ask === "left" || ask === "right" || ask === "both";
}

/** Whether a seat's lean is inside `rangeMilli` of level this instant. */
export function plumbLevel(s: PlumbState, side: 0 | 1, rangeMilli: number): boolean {
  return Math.abs(s.tiltMilli[side]) <= rangeMilli;
}

/** Whether what the lit level step asks for is held this instant. */
export function plumbTrue(s: PlumbState): boolean {
  const step = plumbLitStep(s);
  if (step === null) return false;
  if (step.ask === "left") return plumbLevel(s, 0, step.rangeMilli);
  if (step.ask === "right") return plumbLevel(s, 1, step.rangeMilli);
  if (step.ask === "both")
    return plumbLevel(s, 0, step.rangeMilli) && plumbLevel(s, 1, step.rangeMilli);
  return false;
}

/** The bob swinging free: the fight is over and it is only falling away. */
export function plumbDone(s: PlumbState): boolean {
  return s.phase === "free";
}

/** A fresh bob: both weights loose, the core dark, neither phone read yet. */
export function freshPlumb(beat: number, steps: readonly PlumbStep[]): PlumbState {
  return {
    kind: "plumb",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    weights: [0, 0],
    hits: 0,
    coreLit: false,
    tiltMilli: [PLUMB_UNREAD, PLUMB_UNREAD],
    heldBeats: 0,
  };
}
