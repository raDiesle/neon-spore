import { midCol, type SimConfig } from "./config.js";
import type { World } from "./world.js";

/**
 * THE LATCH: a slime clinging over the field has hooked a tendril into the
 * hull and is reeling it in. The pair haul it back down, hand over hand — one
 * grip each on the same tendril (`docs/spec/bosses-cinematic.md` §2, built
 * 8 October 2026 as a tug of war).
 *
 * **The rule is one sentence**: take turns — one pulls while the other holds
 * — and never let go both at once, or it slips back to the last knot.
 *
 * The tendril is one number, `hauledMilli`: how far it has been pulled down,
 * thousandths of a row. **Only the grip whose turn it is pulls it** (`turn`):
 * it takes hold where the tendril is (`anchorMilli`) and carries it down by
 * the thumb's depth (`depthMilli`), never past `latchReachMilli`, so a knot
 * (`latchKnotMilli`, longer than a reach) takes two pulls at least. The other
 * grip's job is to hold. When the puller lets go after a real pull
 * (`latchStrokeMilli`), the turn passes to the other grip — and if that one is
 * not being held, **both are off at once and the tendril slips back to the
 * last knot** (`floorMilli`). A knot pulled past the floor is kept for good,
 * and is one lobe of the slime torn off. So both seats work all the time: one
 * pulls, the other holds, and they swap.
 *
 * **Three kinds of level**, one new thing each:
 * - `haul`: hand over hand, the pilot's grip on the left and the navigator's
 *   on the right.
 * - `yank`: the slime rears back and yanks every few beats; both hands must
 *   be holding when it does, or the tendril slips back to the last knot.
 * - `cross`: the yanks, with the grips crossed — the pilot's on the right.
 *
 * **Its health is the knots**, and no bar: every knot in is a lobe gone. A
 * level that runs out is the slime tearing the hull, which is the wave.
 */

/** Where the scene is: dropping in, a level lit, resting after one, torn loose and away. */
export const LATCH_PHASES = ["enter", "level", "rest", "spent"] as const;
export type LatchPhase = (typeof LATCH_PHASES)[number];

/** What a level asks. */
export const LATCH_ASKS = ["haul", "yank", "cross"] as const;
export type LatchAsk = (typeof LATCH_ASKS)[number];

/** A grip on the tendril: nought the left, one the right. */
export type LatchGrip = 0 | 1;

/** One level of the script, authored on the wave. */
export interface LatchStep {
  ask: LatchAsk;
  /** Knots to pull in before the level is won. */
  knots: number;
  /** Beats the level may take before the slime tears the hull. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface LatchEntry {
  kind: "latch";
  steps: readonly LatchStep[];
}

export interface LatchState {
  kind: "latch";
  /** Copied at install and never written again. */
  steps: LatchStep[];
  phase: LatchPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The level lit, or the next to light. */
  cursor: number;
  /** How far the tendril has been pulled down, thousandths of a row. */
  hauledMilli: number;
  /** The last knot in: the tendril never slips back past it. */
  floorMilli: number;
  /** Knots pulled in, in every level so far. */
  knots: number;
  /** Knots pulled in during the lit level. */
  levelKnots: number;
  /** Whether each grip has its thumb on it, nought the left. */
  down: [boolean, boolean];
  /** Where on the tendril each grip was taken hold of, thousandths of a row. */
  anchorMilli: [number, number];
  /** How far down each grip has been pulled since, thousandths of a row. */
  depthMilli: [number, number];
  /** The grip that pulls next; the other holds. */
  turn: LatchGrip;
  /** `world.beat` of the next yank, or -1 when none is coming. */
  yankBeat: number;
}

export function latchBoss(world: World): LatchState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "latch" ? boss : null;
}

/** The level lit, or null between levels. */
export function latchLitStep(s: LatchState): LatchStep | null {
  return s.phase === "level" ? (s.steps[s.cursor] ?? null) : null;
}

/** The seat whose thumb takes `grip` in the lit level: crossed in a `cross` level. */
export function latchGripSeat(s: LatchState, grip: LatchGrip): 0 | 1 {
  return s.steps[s.cursor]?.ask === "cross" ? ((1 - grip) as 0 | 1) : grip;
}

/** The grip `seat` takes in the lit level: the same crossing, read the other way. */
export function latchSeatGrip(s: LatchState, seat: 0 | 1): LatchGrip {
  return latchGripSeat(s, seat);
}

/** The column a grip hangs over: one either side of the tendril, which hangs down the middle. */
export function latchGripCol(cfg: SimConfig, grip: LatchGrip): number {
  return midCol(cfg) + (grip === 0 ? -1 : 1);
}

/** The seat whose turn it is to pull, in the lit level. */
export function latchPuller(s: LatchState): 0 | 1 {
  return latchGripSeat(s, s.turn);
}

/** Whether a thumb is holding the tendril at all. */
export function latchHeld(s: LatchState): boolean {
  return s.down[0] || s.down[1];
}

/** How far into the knot being pulled the tendril is, thousandths of a knot. */
export function latchKnotAlong(world: World, s: LatchState): number {
  const knot = world.cfg.latchKnotMilli;
  return Math.max(0, Math.min(1000, Math.round(((s.hauledMilli - s.floorMilli) * 1000) / knot)));
}

/** Whether the slime is rearing back for a yank: the beats just before one. */
export function latchRearing(world: World, s: LatchState): boolean {
  if (s.yankBeat < 0 || latchLitStep(s) === null) return false;
  const left = s.yankBeat - world.beat;
  return left > 0 && left <= world.cfg.latchRearBeats;
}

/** Whether the lit level yanks. */
export function latchYanks(s: LatchState): boolean {
  const ask = latchLitStep(s)?.ask;
  return ask === "yank" || ask === "cross";
}

/** Knots in the whole script: the slime's lobes. */
export function latchKnotsAll(s: LatchState): number {
  return s.steps.reduce((sum, step) => sum + step.knots, 0);
}

/** Torn loose and away: the fight is over. */
export function latchDone(s: LatchState): boolean {
  return s.phase === "spent";
}

/** A fresh tendril: nothing pulled, no thumb on it, no yank coming. */
export function freshLatch(beat: number, steps: readonly LatchStep[]): LatchState {
  return {
    kind: "latch",
    steps: steps.map((step) => ({ ...step })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    hauledMilli: 0,
    floorMilli: 0,
    knots: 0,
    levelKnots: 0,
    down: [false, false],
    anchorMilli: [0, 0],
    depthMilli: [0, 0],
    turn: 0,
    yankBeat: -1,
  };
}
