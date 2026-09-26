import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE VISE: a seed-case of two lobes over the middle column, each cracked by
 * its own seat pinching it shut, and then a kernel that has to be shot in the
 * colour it shows (`docs/spec/bosses-choreographed.md` §28).
 *
 * **The rule is one sentence**: pinch your lobe's gap shut and keep it shut
 * for the beats asked, then shoot the bared kernel in its colour.
 *
 * Each seat has one lobe — the pilot's `viseLobeLeft`, the navigator's
 * `viseLobeRight` — and what a thumb and finger send is the **gap** between
 * them, a distance falling as they converge. A pinch step counts the beats
 * its gap (or, for `both`, both gaps) sits at or under `viseShutMilli`; the
 * gap widening back past it starts the count again. Two cracks split a lobe,
 * both lobes split bare the kernel, and after that the script alternates a
 * shot at the kernel with both seats pinching to hold the lobes off it.
 *
 * **Its health is the four seams and the three shots.** A pinch that runs out
 * is tried again; a shot that runs out is a hull hit, which is the wave.
 */

/** Seams a lobe splits on — a figure of the silhouette, `SEAM_POINTS`' reason. */
export const VISE_SEAMS_PER_LOBE = 2;

/**
 * Where the scene is: settling, a step lit and waiting, the case resting
 * between steps, and the case split down its spine.
 */
export const VISE_PHASES = ["still", "lit", "rest", "split"] as const;
export type VisePhase = (typeof VISE_PHASES)[number];

/**
 * What a step asks: the pilot's lobe pinched shut, the navigator's, a shot at
 * the kernel, or both lobes pinched to hold them off the kernel — and the two
 * story steps once the kernel is bare: the case **biting** down at the hull,
 * answered by the shield under it, and the kernel **spitting** a seed that
 * hangs over another column, answered by a shot up that column.
 */
export const VISE_ASKS = ["left", "right", "fire", "both", "bite", "spit"] as const;
export type ViseAsk = (typeof VISE_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface ViseStep {
  ask: ViseAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /**
   * Beats: how long a pinch must be kept shut, how long a fire step waits
   * for its shot.
   */
  beats: number;
  /** Columns from the middle the seed hangs over. Only a spit step reads it. */
  offset?: number;
}

/** What a wave authors: the whole script, in order. */
export interface ViseEntry {
  kind: "vise";
  steps: readonly ViseStep[];
}

export interface ViseState {
  kind: "vise";
  /** Copied at install and never written again. */
  steps: ViseStep[];
  phase: VisePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** `world.tick` the lit step lit: a shield pressed before it answers no bite. */
  litTick: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Seams cracked on each lobe, the pilot's then the navigator's: nought up to `VISE_SEAMS_PER_LOBE`. */
  cracks: [number, number];
  /** Shots the kernel has taken. */
  hits: number;
  /** Whether the kernel lies bare to be shot. */
  bared: boolean;
  /**
   * Each lobe's gap, in thousandths of a tile: the distance between the two
   * touches on it, or `viseOpenMilli` with no pinch on it at all.
   */
  gapMilli: [number, number];
  /** Beats of the lit pinch step its gap(s) have been kept shut. */
  heldBeats: number;
}

export function viseBoss(world: World): ViseState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "vise" ? boss : null;
}

/** The step lit, or null between steps. */
export function viseLitStep(s: ViseState): ViseStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step is a pinch: one lobe, or both. */
export function vising(s: ViseState): boolean {
  const ask = viseLitStep(s)?.ask;
  return ask === "left" || ask === "right" || ask === "both";
}

/** Whether the lit step is the bite, answered by the shield under the case. */
export function viseBiting(s: ViseState): boolean {
  return viseLitStep(s)?.ask === "bite";
}

/** The column a spit step's seed hangs over: the middle, moved by its offset. */
export function viseSeedCol(mid: number, step: ViseStep): number {
  return mid + (step.offset ?? 0);
}

/** Whether a lobe's gap is pinched shut this instant. */
export function viseShut(world: World, s: ViseState, side: 0 | 1): boolean {
  return s.gapMilli[side] <= world.cfg.viseShutMilli;
}

/** Whether what the lit pinch step asks for is shut this instant. */
export function viseClosed(world: World, s: ViseState): boolean {
  const ask = viseLitStep(s)?.ask;
  if (ask === "left") return viseShut(world, s, 0);
  if (ask === "right") return viseShut(world, s, 1);
  if (ask === "both") return viseShut(world, s, 0) && viseShut(world, s, 1);
  return false;
}

/** The case split: the fight is over and it is only falling. */
export function viseDone(s: ViseState): boolean {
  return s.phase === "split";
}

/** A fresh case: both lobes whole, the kernel covered, no pinch on either. */
export function freshVise(beat: number, steps: readonly ViseStep[], openMilli: number): ViseState {
  return {
    kind: "vise",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    litTick: 0,
    cursor: 0,
    cracks: [0, 0],
    hits: 0,
    bared: false,
    gapMilli: [openMilli, openMilli],
    heldBeats: 0,
  };
}
