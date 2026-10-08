import { midCol, type SimConfig, ticksPerBeat } from "./config.js";
import { mazeCosMilli, mazeSinMilli } from "./maze.js";
import type { World } from "./world.js";

/**
 * THE TRAPEZE: an alien on a swing hung from two long ropes over the middle
 * of the field. The pair swing it higher and higher until the alien kicks
 * the gong hung at the side (`docs/spec/bosses-choreographed.md` §39, the
 * owner's rework of 7 October 2026).
 *
 * **The rule is one sentence**: push the swing when it comes back toward the
 * middle, until it is high enough to kick the gong. A push while it goes out
 * slows it.
 *
 * The swing is a pendulum with a fixed period, kept as two integers: how far
 * it swings (`ampMilli`, thousandths of a degree either side) and where in
 * the swing it is (`swingTick`, ticks into one whole swing). Tick nought is
 * the right end, a quarter the bottom on the way left, a half the left end,
 * three quarters the bottom on the way right. A push adds to the swing and a
 * wrong one takes from it; the swing loses `trapezeDampMilli` a beat on its
 * own, so a pair that stops pushing sees it die down.
 *
 * **Four kinds of level**, one new thing each:
 * - `push`: the pilot swipes on the left side, the navigator on the right.
 * - `call`: who swipes on a side is called just before it, by chance.
 * - `shoot`: no swipes; a bolt from below pushes the alien.
 * - `lock`: the pilot taps the alien to lock the cannon on it and the
 *   navigator fires; the bolt comes in from the side and pushes it away
 *   from the cannon.
 *
 * **Its health is the gongs**, one a level. A level that runs out is the
 * alien jumping at the hull, which is the wave.
 */

/** Where the scene is: swaying in, a level lit, resting after a gong, and over the top and away. */
export const TRAPEZE_PHASES = ["enter", "level", "rest", "spent"] as const;
export type TrapezePhase = (typeof TRAPEZE_PHASES)[number];

/** What a level asks. */
export const TRAPEZE_ASKS = ["push", "call", "shoot", "lock"] as const;
export type TrapezeAsk = (typeof TRAPEZE_ASKS)[number];

/** A side of the swing, and a side's zone: -1 left, 1 right. */
export type TrapezeSide = -1 | 1;

/** One level of the script, authored on the wave. */
export interface TrapezeStep {
  ask: TrapezeAsk;
  /** The side the gong hangs on. */
  gongSide: TrapezeSide;
  /** How far the swing must go to kick it, thousandths of a degree. */
  gongMilli: number;
  /** Beats the level may take before the alien jumps at the hull. */
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
  /** The level lit, or the next to light. */
  cursor: number;
  /** How far the swing goes either side, thousandths of a degree. */
  ampMilli: number;
  /** Ticks into one whole swing; nought is the right end. */
  swingTick: number;
  /** Ends the swing has turned at so far: each half swing is one, and a side's chance to push. */
  half: number;
  /** The `half` a push or a brake was last taken in, so a side pushes once a half swing. */
  pushedHalf: number;
  /** Who pushes on the left and on the right: the seat index, nought the pilot. */
  callers: [0 | 1, 0 | 1];
  /** The zone each seat's finger went down on, nought when none is down. */
  down: [-1 | 0 | 1, -1 | 0 | 1];
  /** Beats the cannon stays locked on the alien, nought when it is not. */
  lockBeats: number;
  /** Gongs kicked: the levels won. */
  gongs: number;
}

export function trapezeBoss(world: World): TrapezeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "trapeze" ? boss : null;
}

/** The level lit, or null between levels. */
export function trapezeLitStep(s: TrapezeState): TrapezeStep | null {
  return s.phase === "level" ? (s.steps[s.cursor] ?? null) : null;
}

/** Ticks in one whole swing. */
export function trapezePeriod(cfg: SimConfig): number {
  return cfg.trapezePeriodBeats * ticksPerBeat(cfg);
}

/** The swing's angle this tick, thousandths of a degree: below nought the left. */
export function trapezeAngle(cfg: SimConfig, s: TrapezeState): number {
  const turn = Math.floor((360_000 * s.swingTick) / trapezePeriod(cfg));
  return Math.round((s.ampMilli * mazeCosMilli(turn)) / 1000);
}

/** The side the swing is on this tick. */
export function trapezeOnSide(cfg: SimConfig, s: TrapezeState): TrapezeSide {
  const q = trapezePeriod(cfg) / 4;
  return s.swingTick >= q && s.swingTick < 3 * q ? -1 : 1;
}

/** Whether the swing is coming back toward the middle this tick, rather than going out. */
export function trapezeInward(cfg: SimConfig, s: TrapezeState): boolean {
  const p = trapezePeriod(cfg);
  const t = s.swingTick;
  return t < p / 4 || (t >= p / 2 && t < (3 * p) / 4);
}

/** Which way the swing is moving this tick: -1 toward the left, 1 toward the right. */
export function trapezeHeading(cfg: SimConfig, s: TrapezeState): TrapezeSide {
  return s.swingTick < trapezePeriod(cfg) / 2 ? -1 : 1;
}

/** Where the alien sits this tick, thousandths of a column and of a row. */
export function trapezeSeat(cfg: SimConfig, s: TrapezeState): { xMilli: number; yMilli: number } {
  const angle = trapezeAngle(cfg, s);
  const rope = cfg.trapezeRopeMilli;
  return {
    xMilli: midCol(cfg) * 1000 + Math.round((rope * mazeSinMilli(angle)) / 1000),
    yMilli: cfg.trapezeAnchorMilli + Math.round((rope * mazeCosMilli(angle)) / 1000),
  };
}

/** Where the gong of `step` hangs: the swing's seat at the gong's angle. */
export function trapezeGongAt(
  cfg: SimConfig,
  step: TrapezeStep,
): { xMilli: number; yMilli: number } {
  const angle = step.gongSide * step.gongMilli;
  const rope = cfg.trapezeRopeMilli;
  return {
    xMilli: midCol(cfg) * 1000 + Math.round((rope * mazeSinMilli(angle)) / 1000),
    yMilli: cfg.trapezeAnchorMilli + Math.round((rope * mazeCosMilli(angle)) / 1000),
  };
}

/** Whether the lit level asks for swipes. */
export function trapezeSwiping(s: TrapezeState): boolean {
  const ask = trapezeLitStep(s)?.ask;
  return ask === "push" || ask === "call";
}

/** Whether the lit level asks for shots. */
export function trapezeShooting(s: TrapezeState): boolean {
  const ask = trapezeLitStep(s)?.ask;
  return ask === "shoot" || ask === "lock";
}

/**
 * The zone that may be pushed this tick, or nought: the side the swing is on
 * while it comes back toward the middle, in a swipe level, once a half swing.
 */
export function trapezeOpenZone(cfg: SimConfig, s: TrapezeState): -1 | 0 | 1 {
  if (!trapezeSwiping(s) || s.pushedHalf === s.half || !trapezeInward(cfg, s)) return 0;
  return trapezeOnSide(cfg, s);
}

/** The seat that pushes on `zone`. */
export function trapezeCaller(s: TrapezeState, zone: TrapezeSide): 0 | 1 {
  return s.callers[zone < 0 ? 0 : 1];
}

/** Whether the cannon is locked on the alien. */
export function trapezeLocked(s: TrapezeState): boolean {
  return s.lockBeats > 0 && trapezeLitStep(s)?.ask === "lock";
}

/** How far the swing has to go yet before it kicks the lit gong, thousandths of a degree; nought when it would. */
export function trapezeShort(s: TrapezeState): number {
  const step = trapezeLitStep(s);
  return step === null ? 0 : Math.max(0, step.gongMilli - s.ampMilli);
}

/** Over the top and away: the fight is over. */
export function trapezeDone(s: TrapezeState): boolean {
  return s.phase === "spent";
}

/** A fresh swing: swaying a little at its right end, no gong kicked, no finger down. */
export function freshTrapeze(
  cfg: SimConfig,
  beat: number,
  steps: readonly TrapezeStep[],
): TrapezeState {
  return {
    kind: "trapeze",
    steps: steps.map((step) => ({ ...step })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    ampMilli: cfg.trapezeStartMilli,
    swingTick: 0,
    half: 0,
    pushedHalf: -1,
    callers: [0, 1],
    down: [0, 0],
    lockBeats: 0,
    gongs: 0,
  };
}
