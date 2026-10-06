import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GOVERNOR: a flywheel governor mid-hull with a needle sweeping its rim
 * on its own, a mark on the rim for each of you to tap as the needle crosses
 * it; then a hub that has to be shot as the needle points down at the cannon
 * (`docs/spec/bosses-choreographed.md` §43, reworked by the owner on
 * 6 October 2026).
 *
 * **The rule is one sentence**: tap as the needle crosses your mark, and
 * shoot when it points down.
 *
 * `needleMilli` is where the needle is, in thousandths of a turn from the
 * top of the rim, and it is **nobody's to move**: it turns on the tick, the
 * lit step's `paceMilli` (`governor-turn.ts`).
 *
 * **Every tap step has a mark for each seat**, so both of you are at work at
 * once. The owner: *both players need to do something at the same time … on
 * the circle, there can be more than one area to tap, so always one for
 * every player. Then in later levels … multiple (more than 2) and a specific
 * order must be followed.* So a step lights all its marks together, each
 * with its seat, and an `ordered` step takes them in the order written,
 * numbered on the dial. Until 6 October 2026 one seat held a two-pad brake
 * while the other tapped; two thumbs on the pads leave none for a mark, so
 * the brake went with the second mark.
 *
 * The tap is `governorTap`, an edge like THE VALVE's pin (`valve-hand.ts`),
 * on both screens and either seat's to press; it lands on the seat's own mark
 * while the needle is within `governorMarkMilli` of it.
 *
 * **Its health is the taps and three shots.** A tap step or a retap that runs
 * out is tried again with what was landed kept, and a retap run out dims the
 * hub until it is made; a shot that runs out is a hull hit, which is the wave.
 */

/** A turn of the rim, in thousandths. */
export const GOVERNOR_TURN_MILLI = 1000;
/** Where the needle points down at the cannon, thousandths of a turn from the top. */
export const GOVERNOR_DOWN_MILLI = 500;

/**
 * Where the scene is: the needle idling before anything is asked, a step lit
 * and waiting, the flywheel resting between steps, and the flyweights flown
 * wide for good, spent.
 */
export const GOVERNOR_PHASES = ["slack", "lit", "rest", "spent"] as const;
export type GovernorPhase = (typeof GOVERNOR_PHASES)[number];

/**
 * What a step asks: the marks tapped, the marks tapped again with the hub
 * lit, or a shot at the hub.
 */
export const GOVERNOR_ASKS = ["tap", "retap", "fire"] as const;
export type GovernorAsk = (typeof GOVERNOR_ASKS)[number];

/** One mark on the rim, and whose thumb lands it. */
export interface GovernorMark {
  seat: 1 | 2;
  /** Where it is on the rim, thousandths of a turn from the top. */
  markMilli: number;
}

/** One step of the script, authored on the wave. */
export interface GovernorStep {
  ask: GovernorAsk;
  /** The marks to land, each seat's own. A fire step has none. */
  marks: readonly GovernorMark[];
  /** Whether the marks are landed in the order written, and numbered so. */
  ordered: boolean;
  /** How far the needle turns a tick while the step is lit, thousandths of a turn. */
  paceMilli: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit: the marks' window, a fire step's wait for its shot. */
  beats: number;
}

/** What a wave authors: the whole script, in order. */
export interface GovernorEntry {
  kind: "governor";
  steps: readonly GovernorStep[];
}

export interface GovernorState {
  kind: "governor";
  /** Copied at install and never written again. */
  steps: GovernorStep[];
  phase: GovernorPhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The step lit, or the next to light. */
  cursor: number;
  /** Where the needle is, thousandths of a turn from the top of the rim. */
  needleMilli: number;
  /** The lit step's marks landed, one bit a mark in the order written. Cleared as the cursor moves. */
  landed: number;
  /** Marks landed by each seat over the fight. */
  taps: [number, number];
  /** Shots the hub has taken. */
  hits: number;
  /** Whether the hub is lit to be shot. */
  hubLit: boolean;
  /** Whether each seat's thumb is down on the tap, so a tap is an edge. */
  tapDown: [boolean, boolean];
}

export function governorBoss(world: World): GovernorState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "governor" ? boss : null;
}

/** The step lit, or null between steps. */
export function governorLitStep(s: GovernorState): GovernorStep | null {
  return s.phase === "lit" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether the lit step asks for marks tapped: a tap or a retap. */
export function governorTapping(s: GovernorState): boolean {
  const ask = governorLitStep(s)?.ask;
  return ask === "tap" || ask === "retap";
}

/** How far the needle is from `markMilli`, the short way round, thousandths of a turn. */
export function governorOff(needleMilli: number, markMilli: number): number {
  const apart =
    (((needleMilli - markMilli) % GOVERNOR_TURN_MILLI) + GOVERNOR_TURN_MILLI) % GOVERNOR_TURN_MILLI;
  return Math.min(apart, GOVERNOR_TURN_MILLI - apart);
}

/** Whether a fire step is lit and the hub lit, so a shot may land. */
export function governorFiring(s: GovernorState): boolean {
  return s.hubLit && governorLitStep(s)?.ask === "fire";
}

/** How far the needle turns a tick now: the lit step's pace, or the idle pace between steps. */
export function governorPace(world: World, s: GovernorState): number {
  return governorLitStep(s)?.paceMilli ?? world.cfg.governorIdleMilli;
}

/**
 * Whether the needle pointed down at the cannon `ago` ticks back — within
 * `governorDownMilli` of the bottom. The pace is the lit step's and does not
 * change while it is lit, so where the needle was is where it is less the
 * turns since.
 */
export function governorDownAgo(world: World, s: GovernorState, ago: number): boolean {
  const then = s.needleMilli - governorPace(world, s) * ago;
  return governorOff(then, GOVERNOR_DOWN_MILLI) <= world.cfg.governorDownMilli;
}

/** The flyweights flown wide and the needle stalled: the fight is over. */
export function governorDone(s: GovernorState): boolean {
  return s.phase === "spent";
}

/** A fresh governor: the needle at the top, nothing landed, no thumb down. */
export function freshGovernor(beat: number, steps: readonly GovernorStep[]): GovernorState {
  return {
    kind: "governor",
    steps: steps.map((step) => ({ ...step, marks: step.marks.map((m) => ({ ...m })) })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    needleMilli: 0,
    landed: 0,
    taps: [0, 0],
    hits: 0,
    hubLit: false,
    tapDown: [false, false],
  };
}
