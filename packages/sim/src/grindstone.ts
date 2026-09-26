import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GRINDSTONE: a gritted wheel on a fixed axle mid-hull, each of its two
 * flats ground clean by its own seat, and then a caliper both seats lock with
 * a chord so the axle can be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §33).
 *
 * **The rule is one sentence**: grind your flat clean before it regrits, then
 * hold the caliper shut together and shoot the lit axle in its colour.
 *
 * No new primitive — two already spent, in an order neither has used. A flat
 * is ground by `RubCount`, THE RIME's wipe (`rime-hand.ts`): the pilot's
 * `grindFlatLeft`, the navigator's `grindFlatRight`, every fresh reversal
 * shaving `grindstoneShaveMilli` off the lit flat's grit and a beat nobody
 * rubbed growing `grindstoneRegrowMilli` back. The caliper is held by
 * `ChordHold`, THE TRIVET's plant (`trivet-hand.ts`): the pilot's
 * `grindJawLeft` and the navigator's `grindJawRight`, each with
 * `GRINDSTONE_PADS` pads that must all be down together. Two passes clear a
 * flat, both flats clear bite the caliper shut and light the axle, and after
 * that the script alternates a shot at the axle with both seats clamping the
 * caliper when it creeps loose.
 *
 * **Its health is the four passes and the three shots.** A pass or a clamp
 * that runs out is tried again; a shot that runs out is a hull hit, which is
 * the wave.
 */

/** Passes that grind a flat clean — rows 2 and 3 of §33, and 4 and 5. */
export const GRINDSTONE_PASSES_PER_FLAT = 2;

/** Pads on each jaw of the caliper, all held for a clamp — §33's "two controls together". */
export const GRINDSTONE_PADS = 2;

/** A flat gritted solid, in thousandths of its face. */
export const GRINDSTONE_FULL_MILLI = 1000;

/**
 * Where the scene is: settling, a step lit and waiting, the wheel resting
 * between steps, and the caliper snapped off with the wheel spinning free.
 */
export const GRINDSTONE_PHASES = ["still", "lit", "rest", "free"] as const;
export type GrindstonePhase = (typeof GRINDSTONE_PHASES)[number];

/**
 * What a step asks: the pilot's flat ground, the navigator's, a shot at the
 * axle, or both seats clamping the caliper shut.
 */
export const GRINDSTONE_ASKS = ["left", "right", "fire", "clamp"] as const;
export type GrindstoneAsk = (typeof GRINDSTONE_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface GrindstoneStep {
  ask: GrindstoneAsk;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats: how long a pass waits, how long a clamp must be held, how long a shot waits. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface GrindstoneEntry {
  kind: "grindstone";
  steps: readonly GrindstoneStep[];
}

export interface GrindstoneState {
  kind: "grindstone";
  /** Copied at install and never written again. */
  steps: GrindstoneStep[];
  phase: GrindstonePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Passes each flat has taken, the pilot's then the navigator's: nought up to `GRINDSTONE_PASSES_PER_FLAT`. */
  passes: [number, number];
  /** Shots the axle has taken. */
  hits: number;
  /** Whether the caliper has bitten and the axle is lit to be shot. */
  locked: boolean;
  /** Each flat's grit, in thousandths of its face: `GRINDSTONE_FULL_MILLI` solid, nought clean. */
  gritMilli: [number, number];
  /** The reversal count last heard on each flat, so only fresh ones shave; nought with no thumb down. */
  rubs: [number, number];
  /** Whether each flat was rubbed since the last beat: a flat rubbed does not regrit. */
  rubbed: [boolean, boolean];
  /** Each seat's jaw pads held down this instant, one bit a pad, the pilot's then the navigator's. */
  padsDown: [number, number];
  /** Beats of the lit clamp step both jaws have been held. */
  heldBeats: number;
}

export function grindstoneBoss(world: World): GrindstoneState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "grindstone" ? boss : null;
}

/** The step lit, or null between steps. */
export function grindstoneLitStep(s: GrindstoneState): GrindstoneStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The flat the lit step asks to be ground, or null when it asks no pass. */
export function grinding(s: GrindstoneState): 0 | 1 | null {
  const ask = grindstoneLitStep(s)?.ask;
  if (ask === "left") return 0;
  if (ask === "right") return 1;
  return null;
}

/** Whether a seat holds every pad of its jaw down this instant. */
export function grindstoneJawHeld(s: GrindstoneState, side: 0 | 1): boolean {
  const mask = (1 << GRINDSTONE_PADS) - 1;
  return (s.padsDown[side] & mask) === mask;
}

/** Whether the lit step is a clamp and both jaws are held shut this instant. */
export function grindstoneClamped(s: GrindstoneState): boolean {
  if (grindstoneLitStep(s)?.ask !== "clamp") return false;
  return grindstoneJawHeld(s, 0) && grindstoneJawHeld(s, 1);
}

/** The wheel spinning free: the fight is over and it is only falling. */
export function grindstoneDone(s: GrindstoneState): boolean {
  return s.phase === "free";
}

/** A fresh wheel: both flats gritted solid, the caliper slack, the axle dark, no hand on it. */
export function freshGrindstone(beat: number, steps: readonly GrindstoneStep[]): GrindstoneState {
  return {
    kind: "grindstone",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    passes: [0, 0],
    hits: 0,
    locked: false,
    gritMilli: [GRINDSTONE_FULL_MILLI, GRINDSTONE_FULL_MILLI],
    rubs: [0, 0],
    rubbed: [false, false],
    padsDown: [0, 0],
    heldBeats: 0,
  };
}
