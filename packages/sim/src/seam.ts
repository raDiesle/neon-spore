import { clampCol, midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE SEAM: a shelled ridge down the middle column with one crack along its
 * spine, and **the choreographed scene built out of nothing but the standard
 * controls** (`docs/spec/bosses-choreographed.md` §26).
 *
 * Each step of its script lights one thing and asks for one answer: a point
 * on the crack to be shot in its colour, grit thrown at the hull to be taken
 * on the shield under the ridge, a rock spat from the crack to be shot out, or
 * grit and a rock at once — one seat on the shield, the other on the trigger.
 * A shot or a shield outside its own step does nothing, which is the whole of
 * what makes it a scene rather than a field boss.
 *
 * **The rule is one sentence**: shoot the lit point in its colour, and shield
 * the grit it throws.
 *
 * **Its health is the three points** the script marks `seals`, one per
 * movement. A step left unanswered is a hull hit, which is the wave.
 */

/**
 * The widened points on the crack, and so the health — a figure of the
 * silhouette rather than a tuning, `VALVE_PINS`' reason.
 */
export const SEAM_POINTS = 3;

/**
 * Where the scene is: settling, a step lit and waiting for its answer, the
 * ridge resting between steps, and the sealed ridge split open.
 */
export const SEAM_PHASES = ["still", "lit", "rest", "split"] as const;
export type SeamPhase = (typeof SEAM_PHASES)[number];

/**
 * What a step asks: a point shot, grit shielded, a rock shot, grit and a rock
 * at once — and the two story steps (§26 rows 5–7 and 12–13): **`blind`**,
 * the ridge turned face away while it throws, its grit taken on the shield
 * with the crack out of sight; and **`glow`**, heat bleeding up through the
 * shell and gathering at one point on the crack, quenched by
 * `seamGlowShots` shots of either colour.
 */
export const SEAM_ASKS = ["point", "grit", "rock", "both", "blind", "glow"] as const;
export type SeamAsk = (typeof SEAM_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface SeamStep {
  ask: SeamAsk;
  /** The colour a shot must be, or `"either"`. Grit never reads it. */
  color: Color | "either";
  /** Columns off the middle a rock is spat at; a point and grit read 0. */
  offset: number;
  /** Whether this point, shot, closes one of the three. */
  seals: boolean;
}

/** What a wave authors: the whole script, in order. */
export interface SeamEntry {
  kind: "seam";
  steps: readonly SeamStep[];
}

export interface SeamState {
  kind: "seam";
  /** Copied at install and never written again. */
  steps: SeamStep[];
  phase: SeamPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Points sealed so far: nought up to `SEAM_POINTS`. */
  sealed: number;
  /** `world.tick` the step lit — a shield pressed before it is not an answer. */
  litTick: number;
  /** Whether this step's shot has landed. */
  shot: boolean;
  /** Whether this step's grit has been taken on the shield. */
  guarded: boolean;
  /** Shots landed on this step's glow, nought up to `seamGlowShots`. */
  quenched: number;
}

export function seamBoss(world: World): SeamState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "seam" ? boss : null;
}

/** The step lit, or null between steps. */
export function seamLitStep(s: SeamState): SeamStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step wants a shot, and has not had it. */
export function seamWantsShot(s: SeamState): boolean {
  const step = seamLitStep(s);
  return step !== null && step.ask !== "grit" && step.ask !== "blind" && !s.shot;
}

/** Whether the lit step wants the shield, and has not had it. */
export function seamWantsShield(s: SeamState): boolean {
  const step = seamLitStep(s);
  return step !== null && seamShields(step) && !s.guarded;
}

/** Whether a step is answered on the shield at all: grit, thrown blind or not. */
export function seamShields(step: SeamStep): boolean {
  return step.ask === "grit" || step.ask === "both" || step.ask === "blind";
}

/** The column a step is answered in: the ridge for everything but a rock,
 * the rock's own column for a rock. */
export function seamStepCol(world: World, step: SeamStep): number {
  const mid = midCol(world.cfg);
  if (step.ask !== "rock" && step.ask !== "both") return mid;
  return clampCol(world.cfg, mid + step.offset);
}

/** The sealed ridge split open: the fight is over and it is only hanging. */
export function seamDone(s: SeamState): boolean {
  return s.phase === "split";
}

/** A fresh ridge: the crack dark, nothing lit and nothing sealed. */
export function freshSeam(beat: number, steps: readonly SeamStep[]): SeamState {
  return {
    kind: "seam",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    sealed: 0,
    litTick: 0,
    shot: false,
    guarded: false,
    quenched: 0,
  };
}
