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
 * `slingDrawRight` — and a draw is **a hold, then a pull in its place** (the
 * owner, 13 October 2026, THE COMBO LAB's HOLD, THEN PULL): a step counts
 * the beats the seat holds its cord, and a lift before the step's `beats`
 * springs the arm slack, the count gone and the step still lit. Once the hold
 * has counted, a fresh press takes the cord's pull and carries it
 * `slingPullMilli` toward the step's `aim` — the one generic PULL — which is
 * a true loose; a pull let go short is said and waits to be taken again. Two loosed draws lock an arm drawn, both arms drawn
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
 * between steps, the fork snapped forward, spent, and the spent yoke ticking
 * as it cools before that (`sling-cool.ts`) — appended last, so the hash's
 * indices keep their places.
 */
export const SLING_PHASES = ["still", "lit", "rest", "free", "cool"] as const;
export type SlingPhase = (typeof SLING_PHASES)[number];

/**
 * What a step asks: the pilot's draw on the left arm, the navigator's on the
 * right, a shot at the yoke, or both seats redrawing at once to hold it.
 */
export const SLING_ASKS = ["left", "right", "fire", "both"] as const;
export type SlingAsk = (typeof SLING_ASKS)[number];

/** Which half a lit column falls in, and so which way a draw's pull must go. */
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
  /** Whether each seat's hold has counted in the lit step: its pull is the next thing asked. */
  held: [boolean, boolean];
  /**
   * How far each seat's pull has come toward the aim, thousandths of a tile;
   * `-1` while no fresh press has taken it — a thumb still down from the hold
   * moves nothing.
   */
  pullMilli: [number, number];
  /** In a `both` step, whether each seat has already loosed true. */
  loosed: [boolean, boolean];
  /** Beats a reflex draw has added to the cool, up to `slingCoolSnaps`. */
  snaps: number;
  /** Whether this beat of the cool has already been stirred by a draw. */
  stirred: boolean;
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

/** Whether the cup asks for a shot: a fire step lit with the yoke lit, the only shot that lands (`sling-shot.ts`). */
export function slingCupAsks(s: SlingState): boolean {
  return slingLitStep(s)?.ask === "fire" && s.yokeLit;
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
    held: [false, false],
    pullMilli: [-1, -1],
    loosed: [false, false],
    snaps: 0,
    stirred: false,
  };
}
