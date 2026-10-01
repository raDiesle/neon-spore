import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE PLUMB: a lopsided bob hung off the hull over the middle column, its two
 * counterweights each brought level by both seats pulling on the stones at
 * once, and then a core that has to be shot in the colour it shows
 * (`docs/spec/bosses-choreographed.md` §31).
 *
 * **The rule is one sentence**: pull the two stones together until the bob
 * hangs true, then shoot the lit core in its colour.
 *
 * Each seat has one stone — the pilot's `plumbLevelLeft`, the navigator's
 * `plumbLevelRight` — and pulls it with a long drag, left or right, in
 * thousandths of a tile (`plumb-hand.ts`). A pull to the right shrinks the
 * left stone and grows the right one, so either seat's pull tips the bob the
 * way the thumb went, and **the bob's lean is the step's skew and the two
 * pulls added** (`plumbOff`). A level step lights with the bob skewed further
 * than one seat can pull (`plumbPullReachMilli`), so it hangs true only while
 * both pull, and counts the beats the sum stays inside its `rangeMilli`;
 * drifting out starts the count again. Two settles lock a weight plumb, both
 * weights plumb light the core, and after that the script alternates a shot
 * at the core with both seats pulling to hold it.
 *
 * It was each seat's phone held level until 27 September 2026, when the owner
 * ruled that no wave may need a tilt sensor.
 *
 * **Its health is the four settles and the three shots.** A level that runs
 * out is tried again; a shot that runs out is a hull hit, which is the wave.
 *
 * **The spent core bleeds its light down the chains** before the bob swings
 * free (§31 row 11, `plumb-bleed.ts`): the one stretch of the fight that asks
 * both seats to leave the stones alone, and a pull costs it a beat.
 */

/** Settles that lock a weight plumb — rows 2 and 3 of §31, and 4 and 5. */
export const PLUMB_SETTLES_PER_WEIGHT = 2;

/**
 * Where the scene is: settling, a step lit and waiting, the bob resting
 * between steps, the bob swinging free, and — between the last shot and the
 * swing, though last in the list so the others keep their places in the
 * hash — the spent core's light bleeding off.
 */
export const PLUMB_PHASES = ["still", "lit", "rest", "free", "bleed"] as const;
export type PlumbPhase = (typeof PLUMB_PHASES)[number];

/**
 * What a step asks: the left weight settled, the right weight settled, a shot
 * at the core, or both weights held true under it. Every level step is both
 * seats pulling; the ask says which weight the pulls settle.
 */
export const PLUMB_ASKS = ["left", "right", "fire", "both"] as const;
export type PlumbAsk = (typeof PLUMB_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface PlumbStep {
  ask: PlumbAsk;
  /**
   * How far off true the bob hangs as the step lights, thousandths of a tile
   * of pull, signed: below nought it leans left and wants both pulls to the
   * right. Only a level step reads it.
   */
  skewMilli: number;
  /** How far off true still counts, thousandths of a tile. Only a level step reads it. */
  rangeMilli: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /**
   * Beats: how long the pulls must hold the bob true, how long a fire step
   * waits for its shot.
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
  /**
   * Each seat's pull this instant, the pilot's then the navigator's,
   * thousandths of a tile and signed, right above nought; nought while its
   * thumb is up. Kept inside `plumbPullReachMilli` either way.
   */
  pullMilli: [number, number];
  /** Beats of the lit level step the pulls have held the bob true. */
  heldBeats: number;
  /** Beats a pull has added to the bleed, up to `plumbBleedFlares`. */
  flares: number;
  /** Whether this beat of the bleed has already cost its beat: one pull or twenty, it is one. */
  stirred: boolean;
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

/**
 * How far off true the bob hangs this instant, thousandths of a tile: the lit
 * level step's skew with both pulls added, right above nought. Nought between
 * level steps, when nothing is skewing it.
 */
export function plumbOff(s: PlumbState): number {
  const step = plumbLitStep(s);
  if (step === null || step.ask === "fire") return 0;
  return step.skewMilli + s.pullMilli[0] + s.pullMilli[1];
}

/** Whether the lit level step's bob is held true this instant: its lean inside the range. */
export function plumbTrue(s: PlumbState): boolean {
  const step = plumbLitStep(s);
  if (step === null || step.ask === "fire") return false;
  return Math.abs(plumbOff(s)) <= step.rangeMilli;
}

/**
 * Whether seat `side`'s stone is asked for this instant: a level step is lit,
 * and that seat's pull does not yet lean the way true is. A thumb up, or one
 * pulling the bob further off, is still asked; one pulling towards true is
 * doing its half, whether or not the sum is in range yet.
 */
export function plumbStoneAsks(s: PlumbState, side: 0 | 1): boolean {
  const step = plumbLitStep(s);
  if (step === null || !levelling(s)) return false;
  return !(s.pullMilli[side] * step.skewMilli < 0);
}

/** Whether the core is asked for a shot this instant: a fire step lit, with the core lit. */
export function plumbCoreAsks(s: PlumbState): boolean {
  return plumbLitStep(s)?.ask === "fire" && s.coreLit;
}

/** The bob swinging free: the fight is over and it is only falling away. */
export function plumbDone(s: PlumbState): boolean {
  return s.phase === "free";
}

/** A fresh bob: both weights loose, the core dark, neither stone pulled. */
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
    pullMilli: [0, 0],
    heldBeats: 0,
    flares: 0,
    stirred: false,
  };
}
