import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TRIVET: a three-legged stand splayed over the middle column, each outer
 * foot planted by its own seat holding a chord of pads down together, and
 * then a hub that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §30).
 *
 * **The rule is one sentence**: hold your lit pads down together until your
 * foot plants, then shoot the lit hub in its colour.
 *
 * Each seat has one foot — the pilot's `trivetPadFront`, the navigator's
 * `trivetPadRear` — and a row of `TRIVET_PADS` sockets on it, the drag's `id`
 * naming which. A chord step lights the first `pads` of them and counts the
 * beats all of those are down together (for `both`, both seats' chords); any
 * of them lifting starts the count again. Two plants drive a foot home, both
 * feet home light the hub, and after that the script alternates a shot at the
 * hub with both seats chording to keep the feet planted under it.
 *
 * **Two story steps** break the alternation. **The lurch** (`tip`): the stand
 * leans hard onto one foot and the hub swings out over another column; that
 * foot's seat holds its chord to keep the stand from going over while the
 * pair shoots the swung hub there, in its colour. **The needle**: the hub
 * flings a needle down a column off the middle, turned by the shield under it.
 *
 * **Its health is the four plants and the four shots.** A chord that runs
 * out is tried again; a shot or a needle that runs out is a hull hit, which
 * is the wave.
 */

/** Sockets on each foot — a figure of the silhouette, `SEAM_POINTS`' reason. */
export const TRIVET_PADS = 3;

/** Plants that drive a foot fully home — rows 2 and 3 of §30, and 4 and 5. */
export const TRIVET_PLANTS_PER_FOOT = 2;

/**
 * Where the scene is: settling, a step lit and waiting, the stand resting
 * between steps, and the stand collapsing.
 */
export const TRIVET_PHASES = ["still", "lit", "rest", "collapse"] as const;
export type TrivetPhase = (typeof TRIVET_PHASES)[number];

/**
 * What a step asks: the pilot's chord on the front foot, the navigator's on
 * the rear, a shot at the hub, both chords at once to keep the feet planted
 * under it, the lurch (a chord held and the swung hub shot), or the needle.
 */
export const TRIVET_ASKS = ["front", "rear", "fire", "both", "tip", "needle"] as const;
export type TrivetAsk = (typeof TRIVET_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface TrivetStep {
  ask: TrivetAsk;
  /** Pads a chord or lurch step lights, from the first: two or `TRIVET_PADS`. */
  pads: number;
  /** The colour a shot must be, or `"either"`. A fire or lurch step reads it. */
  color: Color | "either";
  /**
   * Beats: how long a chord must be held, how long a fire step waits for its
   * shot.
   */
  beats: number;
  /**
   * Columns off the middle the lurch swings the hub, or the needle falls:
   * below nought the lurch leans on the front foot, above on the rear. Only
   * a lurch or a needle reads it.
   */
  offset?: number;
}

/** What a wave authors: the whole script, in order. */
export interface TrivetEntry {
  kind: "trivet";
  steps: readonly TrivetStep[];
}

export interface TrivetState {
  kind: "trivet";
  /** Copied at install and never written again. */
  steps: TrivetStep[];
  phase: TrivetPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Plants on each foot, the pilot's then the navigator's: nought up to `TRIVET_PLANTS_PER_FOOT`. */
  feet: [number, number];
  /** Shots the hub has taken. */
  hits: number;
  /** Whether the hub is lit and held down to be shot. */
  hubLit: boolean;
  /** Each seat's pads held down this instant, one bit a pad, the pilot's then the navigator's. */
  padsDown: [number, number];
  /** Beats of the lit chord step its chord(s) have been held. */
  heldBeats: number;
  /** `world.tick` the lit step lit: a shield pressed before it turns no needle. */
  litTick: number;
}

export function trivetBoss(world: World): TrivetState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "trivet" ? boss : null;
}

/** The step lit, or null between steps. */
export function trivetLitStep(s: TrivetState): TrivetStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** The column a lurch swings the hub over, or a needle falls down. */
export function trivetStepCol(mid: number, step: TrivetStep): number {
  return mid + (step.offset ?? 0);
}

/** The foot a lurch leans on: the front, the pilot's, below the middle. */
export function trivetTipSide(step: TrivetStep): 0 | 1 {
  return (step.offset ?? 0) < 0 ? 0 : 1;
}

/** Whether the lit step is a chord: one foot, or both. */
export function chording(s: TrivetState): boolean {
  const ask = trivetLitStep(s)?.ask;
  return ask === "front" || ask === "rear" || ask === "both";
}

/** Whether a seat holds every pad `pads` lights, from the first, down this instant. */
export function trivetChordHeld(s: TrivetState, side: 0 | 1, pads: number): boolean {
  const mask = (1 << Math.min(TRIVET_PADS, Math.max(1, pads))) - 1;
  return (s.padsDown[side] & mask) === mask;
}

/** Whether what the lit chord step asks for is held this instant. */
export function trivetClosed(s: TrivetState): boolean {
  const step = trivetLitStep(s);
  if (step === null) return false;
  if (step.ask === "front") return trivetChordHeld(s, 0, step.pads);
  if (step.ask === "rear") return trivetChordHeld(s, 1, step.pads);
  if (step.ask === "both")
    return trivetChordHeld(s, 0, step.pads) && trivetChordHeld(s, 1, step.pads);
  return false;
}

/** The stand collapsing: the fight is over and it is only falling. */
export function trivetDone(s: TrivetState): boolean {
  return s.phase === "collapse";
}

/** A fresh stand: both feet lifted, the hub dark, no pad down on either. */
export function freshTrivet(beat: number, steps: readonly TrivetStep[]): TrivetState {
  return {
    kind: "trivet",
    steps: steps.map((step) => ({ ...step })),
    phase: "still",
    phaseBeat: beat,
    cursor: 0,
    feet: [0, 0],
    hits: 0,
    hubLit: false,
    padsDown: [0, 0],
    heldBeats: 0,
    litTick: 0,
  };
}
