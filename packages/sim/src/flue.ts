import { midCol, type SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE FLUE: a slotted exhaust flue mid-hull with an ember drifting inside it
 * on its own, steadied only while one seat sends nothing at all, and tapped
 * three times by the other while it stays steady; then a core bared under a
 * damper that stays open only while both hands are off
 * (`docs/spec/bosses-choreographed.md` §40).
 *
 * **The rule is one sentence**: one of you keeps still until the ember
 * steadies, and the other taps it three times before the still one moves.
 *
 * `emberMilli` is where the ember is, in thousandths of a column off the
 * middle one, and it is **nobody's to move**: the simulation drifts it
 * `flueDriftMilli` a beat, back and forth inside `flueSpanMilli` either side,
 * THE BURGEE's undriven sweep (`burgee.ts`). The rest is THE HALTER's
 * `RestraintGate` (`halter.ts`): every command a seat sends, of any kind,
 * zeroes its count, and a beat with nothing in it adds one. At
 * `flueRestThreshold` the ember stops dead on the nearest column.
 *
 * **The coupling is the boss.** A tap lands only while the ember is steady,
 * and on the column it sits over; each one moves it to the next notch the
 * step authors. The instant the resting seat sends anything, mid-count, the
 * taps already landed go back to nought with the rest — the whole three must
 * be spent inside one unbroken stillness.
 *
 * **Its health is two vents of three taps and three shots.** A vent or a
 * damper that runs out is tried again; a shot that runs out is a hull hit,
 * which is the wave.
 */

/** Taps that spend one vent. */
export const FLUE_TAPS = 3;
/** Vents that bare the core — movements 1 and 2 of §40. */
export const FLUE_VENTS = 2;

/**
 * Where the scene is: the ember drifting loose before anything is asked, a
 * step lit and waiting, the flue resting between steps, and the damper
 * swung open for good, spent.
 */
export const FLUE_PHASES = ["slack", "lit", "rest", "spent"] as const;
export type FluePhase = (typeof FLUE_PHASES)[number];

/**
 * What a step asks: one seat still while the other taps the steadied ember
 * three times, both seats still while the damper creeps shut, or a shot at
 * the bared core.
 */
export const FLUE_ASKS = ["vent", "damper", "fire"] as const;
export type FlueAsk = (typeof FLUE_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface FlueStep {
  ask: FlueAsk;
  /** The seat that keeps still on a vent; the other taps. A damper and a shot read `"both"`. */
  rester: 1 | 2 | "both";
  /**
   * Where the ember moves after the first and the second landed tap, as
   * columns off the middle one. Only a vent reads it.
   */
  notches: readonly number[];
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit: a vent's or a damper's window, a fire step's wait for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface FlueEntry {
  kind: "flue";
  steps: readonly FlueStep[];
}

export interface FlueState {
  kind: "flue";
  /** Copied at install and never written again. */
  steps: FlueStep[];
  phase: FluePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Where the ember is, thousandths of a column off the middle column. */
  emberMilli: number;
  /** Which way it drifts: 1 toward the right, -1 toward the left. */
  emberDir: 1 | -1;
  /** Taps landed in the vent lit, nought up to `FLUE_TAPS`. */
  taps: number;
  /** Vents spent: nought up to `FLUE_VENTS`. */
  vents: number;
  /** Shots the core has taken. */
  hits: number;
  /** Whether the core is bared to be shot. */
  bared: boolean;
  /** Beats in a row each seat has sent nothing, held at `flueRestThreshold`. */
  restBeats: [number, number];
  /** Whether each seat has sent a command since the last beat, so that beat is not counted. */
  stirred: [boolean, boolean];
  /** Whether each seat's thumb is down on the ember, so a tap is an edge. */
  tapDown: [boolean, boolean];
}

export function flueBoss(world: World): FlueState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "flue" ? boss : null;
}

/** The step lit, or null between steps. */
export function flueLitStep(s: FlueState): FlueStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** A seat, 1 or 2, as an index into the pairs. */
export function flueSeatIndex(seat: 1 | 2): 0 | 1 {
  return seat === 1 ? 0 : 1;
}

/** The seat that must keep still in the lit step: one on a vent, both on a damper, none otherwise. */
export function flueResters(s: FlueState): readonly (1 | 2)[] {
  const step = flueLitStep(s);
  if (step === null || step.ask === "fire") return [];
  if (step.ask === "damper" || step.rester === "both") return [1, 2];
  return [step.rester];
}

/** The seat that taps the lit vent's ember, or null when no vent is lit. */
export function flueTapper(s: FlueState): 1 | 2 | null {
  const step = flueLitStep(s);
  if (step?.ask !== "vent" || step.rester === "both") return null;
  return step.rester === 1 ? 2 : 1;
}

/** Whether every seat the lit step asks to keep still has kept still to the threshold. */
export function flueSettled(world: World, s: FlueState): boolean {
  const resters = flueResters(s);
  if (resters.length === 0) return false;
  const threshold = world.cfg.flueRestThreshold;
  return resters.every((seat) => s.restBeats[flueSeatIndex(seat)] >= threshold);
}

/** Whether the ember is steady — a vent lit and its rester settled — so a tap may land. */
export function flueSteady(world: World, s: FlueState): boolean {
  return flueLitStep(s)?.ask === "vent" && flueSettled(world, s);
}

/** The column the ember sits over, rounded; the one a tap must name while it is steady. */
export function flueEmberCol(cfg: SimConfig, s: FlueState): number {
  return midCol(cfg) + Math.round(s.emberMilli / 1000);
}

/** Whether the ember drifts this beat: loose, and the fight not spent. */
export function flueDrifts(world: World, s: FlueState): boolean {
  return s.phase !== "spent" && !flueSteady(world, s);
}

/** Whether a fire step is lit and the core bared, so a shot may land. */
export function flueFiring(s: FlueState): boolean {
  return s.bared && flueLitStep(s)?.ask === "fire";
}

/** The damper swung open and the ember gone still: the fight is over. */
export function flueDone(s: FlueState): boolean {
  return s.phase === "spent";
}

/** A fresh flue: the ember over the middle drifting right, nothing spent, no thumb down. */
export function freshFlue(beat: number, steps: readonly FlueStep[]): FlueState {
  return {
    kind: "flue",
    steps: steps.map((step) => ({ ...step, notches: [...step.notches] })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    emberMilli: 0,
    emberDir: 1,
    taps: 0,
    vents: 0,
    hits: 0,
    bared: false,
    restBeats: [0, 0],
    stirred: [false, false],
    tapDown: [false, false],
  };
}
