import { midCol, type SimConfig } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE TRAPEZE: a pennant on a free-swinging boom mid-hull, swinging across the
 * middle columns on its own, stilled by one seat's tap and caught by the
 * other seat's draw, and then a spindle that has to be shot in the colour it
 * shows (`docs/spec/bosses-choreographed.md` §39).
 *
 * **The rule is one sentence**: tap the flag still over the lit column, and
 * while it is still your partner looses a held draw toward it; then shoot
 * the lit spindle in its colour.
 *
 * `swingMilli` is where the flag is, in thousandths of a column off the
 * middle one, and it is **nobody's to move**: the simulation swings it
 * `sweepMilli` a beat, back and forth inside `trapezeSpanMilli` either side.
 * The tap is THE VALVE's pin and THE CYST's mark (`FreezeTap`): an edge, and
 * it lands only while the flag is over the lit column — within
 * `trapezeMarkMilli` of it — stopping the swing dead for `trapezeFreezeBeats`.
 * The draw is THE SLING's (`DrawRelease`): held `trapezeDrawBeats`, and the
 * lift carries the swipe's sign. A lift lands a catch only while the flag is
 * still frozen and only swiping toward the lit column's half.
 *
 * Both handles are on both screens and either seat may press either; which
 * one is live is the lit step's. On the first catch the pilot freezes and the
 * navigator draws, on the second the other way about, and on a recatch
 * whoever taps first is the freezer and the other seat draws.
 *
 * **Its health is two catches and three shots.** A catch or a recatch that
 * runs out is tried again, and a recatch run out dims the spindle until it is
 * made; a shot that runs out is a hull hit, which is the wave.
 */

/** Catches that light the spindle — rows 2 and 3 of §39. */
export const TRAPEZE_CATCHES = 2;

/**
 * Where the scene is: the flag swinging loose before anything is asked, a
 * step lit and waiting, the boom resting between steps, and the flag
 * swinging free, spent.
 */
export const TRAPEZE_PHASES = ["slack", "lit", "rest", "spent"] as const;
export type TrapezePhase = (typeof TRAPEZE_PHASES)[number];

/**
 * What a step asks: the flag caught by the step's own freezer and the other
 * seat, the flag caught again off the lit spindle by either freezer, or a
 * shot at the spindle.
 */
export const TRAPEZE_ASKS = ["catch", "recatch", "fire"] as const;
export type TrapezeAsk = (typeof TRAPEZE_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface TrapezeStep {
  ask: TrapezeAsk;
  /** The seat whose tap stills the flag, or `"either"`. A catch names one; a recatch is either. */
  freezer: 1 | 2 | "either";
  /**
   * The lit column, as columns off the middle: below nought the left half,
   * above it the right, and the way a loose must swipe. A catch or a recatch reads it.
   */
  offset: number;
  /** How far the flag swings a beat while the step is lit, thousandths of a column. */
  sweepMilli: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit: a catch's window, a fire step's wait for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface TrapezeEntry {
  kind: "trapeze";
  steps: readonly TrapezeStep[];
}

export interface TrapezeState {
  kind: "trapeze";
  /** Copied at install and never written again. */
  steps: TrapezeStep[];
  phase: TrapezePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Where the flag is, thousandths of a column off the middle column. */
  swingMilli: number;
  /** Which way it is swinging: 1 toward the right, -1 toward the left. */
  swingDir: 1 | -1;
  /** Beats the flag stays frozen, nought when it swings. */
  frozenBeats: number;
  /** The seat index whose tap froze it, 0 the pilot, or null. */
  frozenBy: 0 | 1 | null;
  /** Catches landed: nought up to `TRAPEZE_CATCHES`. */
  catches: number;
  /** Shots the spindle has taken. */
  hits: number;
  /** Whether the spindle is lit to be shot. */
  spindleLit: boolean;
  /** Whether each seat's thumb is down on the freeze mark, so a tap is an edge. */
  tapDown: [boolean, boolean];
  /** Whether each seat's finger is down on its draw this instant. */
  holding: [boolean, boolean];
  /** Beats each seat has held its draw in the lit step, up to `trapezeDrawBeats`. */
  drawnBeats: [number, number];
}

export function trapezeBoss(world: World): TrapezeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "trapeze" ? boss : null;
}

/** The step lit, or null between steps. */
export function trapezeLitStep(s: TrapezeState): TrapezeStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step asks for the flag caught: a catch or a recatch. */
export function trapezeCatching(s: TrapezeState): boolean {
  const ask = trapezeLitStep(s)?.ask;
  return ask === "catch" || ask === "recatch";
}

/** The column the lit step wants the flag over, or null when none is lit. */
export function trapezeMarkCol(cfg: SimConfig, s: TrapezeState): number | null {
  const step = trapezeLitStep(s);
  if (step === null || step.ask === "fire") return null;
  return midCol(cfg) + step.offset;
}

/** Whether the flag is over the lit column this instant. */
export function trapezeOnMark(world: World, s: TrapezeState): boolean {
  const step = trapezeLitStep(s);
  if (step === null || step.ask === "fire") return false;
  return Math.abs(s.swingMilli - step.offset * 1000) <= world.cfg.trapezeMarkMilli;
}

/** Whether the flag is frozen still. */
export function trapezeFrozen(s: TrapezeState): boolean {
  return s.frozenBeats > 0;
}

/** Whether this seat's tap may still the flag in the lit step. */
export function trapezeFreezes(s: TrapezeState, side: 0 | 1): boolean {
  if (!trapezeCatching(s)) return false;
  const freezer = trapezeLitStep(s)?.freezer;
  return freezer === "either" || freezer === side + 1;
}

/** Whether this seat's draw is the one the lit step asks for: the seat that is not the freezer. */
export function trapezeAims(s: TrapezeState, side: 0 | 1): boolean {
  if (!trapezeCatching(s)) return false;
  const freezer = trapezeLitStep(s)?.freezer;
  if (freezer === "either") return s.frozenBy !== side;
  return freezer !== side + 1;
}

/** Whether the freeze mark asks this seat's tap: its tap may still the flag, and it is not still already. */
export function trapezeFreezeAsks(s: TrapezeState, side: 0 | 1): boolean {
  return trapezeFreezes(s, side) && !trapezeFrozen(s);
}

/** Whether the spindle asks for a shot: a fire step lit with the spindle lit. */
export function trapezeSpindleAsks(s: TrapezeState): boolean {
  return s.spindleLit && trapezeLitStep(s)?.ask === "fire";
}

/**
 * Whether the flag is held on the lit spindle rather than swinging: once both
 * catches are in, and until a recatch lights with the flag creeping loose, or
 * the fight is over.
 */
export function trapezeHeld(s: TrapezeState): boolean {
  return s.spindleLit && s.phase !== "spent" && trapezeLitStep(s)?.ask !== "recatch";
}

/** The side a swipe went, from its signed `fromMilli`: -1 left, 1 right, 0 a lift with no swipe. */
export function trapezeSwipe(fromMilli: number): -1 | 0 | 1 {
  return fromMilli < 0 ? -1 : fromMilli > 0 ? 1 : 0;
}

/** The flag swinging free and the spindle spent: the fight is over. */
export function trapezeDone(s: TrapezeState): boolean {
  return s.phase === "spent";
}

/** A fresh flag: hanging over the middle, swinging right, nothing caught, no thumb down. */
export function freshTrapeze(beat: number, steps: readonly TrapezeStep[]): TrapezeState {
  return {
    kind: "trapeze",
    steps: steps.map((step) => ({ ...step })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    swingMilli: 0,
    swingDir: 1,
    frozenBeats: 0,
    frozenBy: null,
    catches: 0,
    hits: 0,
    spindleLit: false,
    tapDown: [false, false],
    holding: [false, false],
    drawnBeats: [0, 0],
  };
}
