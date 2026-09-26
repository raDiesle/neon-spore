import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE SLING: a forked arm bolted mid-hull, its two draw-arms each cocked by
 * one seat holding a finger down and loosed by the way that finger leaves,
 * and then a yoke that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §32).
 *
 * **The rule is one sentence**: hold your draw until it is home, then loose
 * it toward the lit side; shoot the lit yoke in its colour.
 *
 * Each seat has one arm — the pilot's `slingDrawLeft`, the navigator's
 * `slingDrawRight` — and holds it as a drag: `on: true` is the finger down,
 * and the lift carries the swipe's direction on `fromMilli`, its sign alone
 * (`DrawRelease`, §32's primitive). A draw step counts the beats the seat has
 * held; a lift that has held the step's `beats` and swipes toward its `aim`
 * is a true loose, and anything else springs the arm slack, the count gone
 * and the step still lit. Two loosed draws lock an arm drawn, both arms drawn
 * light the yoke, and after that the script alternates a shot at the yoke
 * with both seats redrawing at once to keep it lit.
 *
 * **Its health is the four draws and the three shots.** A draw that runs out
 * is tried again; a shot that runs out is a hull hit, which is the wave.
 */

/** Draws that lock an arm drawn — rows 2 and 3 of §32, and 4 and 5. */
export const SLING_DRAWS_PER_ARM = 2;

/**
 * Where the scene is: settling, a step lit and waiting, the fork resting
 * between steps, and the fork snapped forward, spent.
 */
export const SLING_PHASES = ["still", "lit", "rest", "free"] as const;
export type SlingPhase = (typeof SLING_PHASES)[number];

/**
 * What a step asks: the pilot's draw on the left arm, the navigator's on the
 * right, a shot at the yoke, or both seats redrawing at once to hold it.
 */
export const SLING_ASKS = ["left", "right", "fire", "both"] as const;
export type SlingAsk = (typeof SLING_ASKS)[number];

/** Which half a lit column falls in, and so which way a draw must be loosed. */
export const SLING_AIMS = ["left", "right"] as const;
export type SlingAim = (typeof SLING_AIMS)[number];

/** One step of the script, authored on the wave. */
export interface SlingStep {
  ask: SlingAsk;
  /** The side the lit column is on, which a loose must swipe toward. Only a draw step reads it. */
  aim: SlingAim;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats: how long a draw must be held, how long a fire step waits for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface SlingEntry {
  kind: "sling";
  steps: readonly SlingStep[];
}

export interface SlingState {
  kind: "sling";
  /** Copied at install and never written again. */
  steps: SlingStep[];
  phase: SlingPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Loosed draws on each arm, the pilot's then the navigator's: nought up to `SLING_DRAWS_PER_ARM`. */
  arms: [number, number];
  /** Shots the yoke has taken. */
  hits: number;
  /** Whether the yoke is lit and held drawn to be shot. */
  yokeLit: boolean;
  /** Whether each seat's finger is down on its draw this instant. */
  holding: [boolean, boolean];
  /** Beats each seat has held its draw in the lit step, up to the step's `beats`. */
  drawnBeats: [number, number];
  /** In a `both` step, whether each seat has already loosed true. */
  loosed: [boolean, boolean];
}

export function slingBoss(world: World): SlingState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "sling" ? boss : null;
}

/** The step lit, or null between steps. */
export function slingLitStep(s: SlingState): SlingStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step asks this seat to draw and it has not yet loosed. */
export function slingAsks(s: SlingState, side: 0 | 1): boolean {
  const ask = slingLitStep(s)?.ask;
  if (ask === "both") return !s.loosed[side];
  return ask === (side === 0 ? "left" : "right");
}

/** The side a swipe went, from its signed `fromMilli`, or null for a lift with no swipe. */
export function slingSwipe(fromMilli: number): SlingAim | null {
  if (fromMilli < 0) return "left";
  if (fromMilli > 0) return "right";
  return null;
}

/** The fork snapped forward: the fight is over and it is only falling away. */
export function slingDone(s: SlingState): boolean {
  return s.phase === "free";
}

/** A fresh fork: both arms slack, the yoke dark, no finger down. */
export function freshSling(beat: number, steps: readonly SlingStep[]): SlingState {
  return {
    kind: "sling",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    arms: [0, 0],
    hits: 0,
    yokeLit: false,
    holding: [false, false],
    drawnBeats: [0, 0],
    loosed: [false, false],
  };
}
