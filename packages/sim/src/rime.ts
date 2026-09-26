import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE RIME: a frosted lens of two halves over the middle column, each wiped
 * clear by its own seat, and then a core that has to be shot in the colour it
 * shows (`docs/spec/bosses-choreographed.md` §29).
 *
 * **The rule is one sentence**: wipe your half clear before it frosts back,
 * then shoot the bared core in its colour and shield it when the frost surges.
 *
 * Each seat has one half — the pilot's `rimeHalfLeft`, the navigator's
 * `rimeHalfRight` — and what a wiping thumb sends is **how many times it has
 * turned back** since it went down: `RubCount`, §29's primitive. Every fresh
 * reversal on a lit half shaves `rimeShaveMilli` off its frost; a lit half
 * nobody rubbed through a beat grows `rimeRegrowMilli` back. Two wipes clear a
 * half, both halves clear bare the core, and after that the script alternates
 * a shot at the core with the shield held against a surge of frost.
 *
 * **Its health is the four wipes and the three shots.** A wipe or a surge that
 * runs out is tried again; a shot that runs out is a hull hit, which is the
 * wave.
 */

/** Wipes a half clears on — a figure of the silhouette, `SEAM_POINTS`' reason. */
export const RIME_WIPES_PER_HALF = 2;

/** A half frosted solid, in thousandths of its face. */
export const RIME_FULL_MILLI = 1000;

/**
 * Where the scene is: settling, a step lit and waiting, the lens resting
 * between steps, and the lens shattered.
 */
export const RIME_PHASES = ["still", "lit", "rest", "shattered"] as const;
export type RimePhase = (typeof RIME_PHASES)[number];

/**
 * What a step asks: the pilot's half wiped clear, the navigator's, a shot at
 * the core, or the shield raised against a surge.
 */
export const RIME_ASKS = ["left", "right", "fire", "shield"] as const;
export type RimeAsk = (typeof RIME_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface RimeStep {
  ask: RimeAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit waiting for its answer. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface RimeEntry {
  kind: "rime";
  steps: readonly RimeStep[];
}

export interface RimeState {
  kind: "rime";
  /** Copied at install and never written again. */
  steps: RimeStep[];
  phase: RimePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** `world.tick` the lit step lit: a guard pressed before it answers nothing. */
  litTick: number;
  /** Wipes each half has taken, the pilot's then the navigator's: nought up to `RIME_WIPES_PER_HALF`. */
  wipes: [number, number];
  /** Shots the core has taken. */
  hits: number;
  /** Whether the core lies bare to be shot. */
  bared: boolean;
  /** Each half's frost, in thousandths of its face: `RIME_FULL_MILLI` solid, nought clear. */
  rimeMilli: [number, number];
  /** The reversal count last heard on each half, so only fresh ones shave; nought with no thumb down. */
  rubs: [number, number];
  /** Whether each half was rubbed since the last beat: a half rubbed does not regrow. */
  rubbed: [boolean, boolean];
}

export function rimeBoss(world: World): RimeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "rime" ? boss : null;
}

/** The step lit, or null between steps. */
export function rimeLitStep(s: RimeState): RimeStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The half the lit step asks to be wiped, or null when it asks no wipe. */
export function rimeWiping(s: RimeState): 0 | 1 | null {
  const ask = rimeLitStep(s)?.ask;
  if (ask === "left") return 0;
  if (ask === "right") return 1;
  return null;
}

/** The lens shattered: the fight is over and it is only falling. */
export function rimeDone(s: RimeState): boolean {
  return s.phase === "shattered";
}

/** A fresh lens: both halves frosted solid, the core covered, no thumb on either. */
export function freshRime(beat: number, steps: readonly RimeStep[]): RimeState {
  return {
    kind: "rime",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    litTick: 0,
    wipes: [0, 0],
    hits: 0,
    bared: false,
    rimeMilli: [RIME_FULL_MILLI, RIME_FULL_MILLI],
    rubs: [0, 0],
    rubbed: [false, false],
  };
}
