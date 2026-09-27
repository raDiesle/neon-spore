import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GOVERNOR: a flywheel governor mid-hull with a needle sweeping its rim
 * on its own, kept slow by one seat's chord on the brake and tapped by the
 * other seat as it crosses the lit mark; then a hub that has to be shot in
 * the colour it shows (`docs/spec/bosses-choreographed.md` §43).
 *
 * **The rule is one sentence**: one of you holds both brake pads down to
 * keep the needle slow, and the other taps as it crosses the lit mark.
 *
 * `needleMilli` is where the needle is, in thousandths of a turn from the
 * top of the rim, and it is **nobody's to move**: it turns on the tick, the
 * lit step's `paceMilli` times `speedMilli` (`governor-turn.ts`). The brake is
 * THE TRIVET's `ChordHold` (`trivet-hand.ts`): `governorChordLeft` is the
 * pilot's two pads and `governorChordRight` the navigator's. **The chord never
 * gates the tap** — the first coupling on the page that does not: while the
 * governing seat's chord is whole `speedMilli` eases back to 1×, and the
 * instant a pad lifts it climbs toward 2×. A tap on a needle running hot
 * counts exactly as one landed slow, and nothing already landed is undone.
 *
 * The tap is `governorTap`, an edge like THE VALVE's pin (`valve-hand.ts`),
 * on both screens and either seat's to press; only the lit step's tapper
 * counts, and only while the needle is within `governorMarkMilli` of the mark.
 *
 * **Its health is two runs of three taps and three shots.** A tap or a retap
 * that runs out is tried again, and a retap run out dims the hub until it is
 * made; a shot that runs out is a hull hit, which is the wave.
 */

/** Taps that spend one seat's run — rows 3–5 and 7–9 of §43. */
export const GOVERNOR_RUN = 3;
/** Pads in one seat's chord: both down is the brake shut. */
export const GOVERNOR_PADS = 2;
/** The mask of a whole chord, every pad down. */
const WHOLE = (1 << GOVERNOR_PADS) - 1;
/** A turn of the rim, in thousandths. */
export const GOVERNOR_TURN_MILLI = 1000;

/**
 * Where the scene is: the needle idling before anything is asked, a step lit
 * and waiting, the flywheel resting between steps, and the flyweights flown
 * wide for good, spent.
 */
export const GOVERNOR_PHASES = ["slack", "lit", "rest", "spent"] as const;
export type GovernorPhase = (typeof GOVERNOR_PHASES)[number];

/**
 * What a step asks: the needle tapped on its mark by the step's tapper, the
 * needle tapped again with the hub lit, or a shot at the hub.
 */
export const GOVERNOR_ASKS = ["tap", "retap", "fire"] as const;
export type GovernorAsk = (typeof GOVERNOR_ASKS)[number];

/** One step of the script, authored on the wave. */
export interface GovernorStep {
  ask: GovernorAsk;
  /** The seat that taps; the other holds the brake. A fire step reads nothing here. */
  tapper: 1 | 2;
  /** Where the lit mark is on the rim, thousandths of a turn from the top. */
  markMilli: number;
  /** How far the needle turns a tick at 1× while the step is lit, thousandths of a turn. */
  paceMilli: number;
  /** The colour a shot must be, or `"either"`. Only a fire step reads it. */
  color: Color | "either";
  /** Beats the step stays lit: a tap's window, a fire step's wait for its shot. */
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
  /** How fast it turns against its pace, in thousandths: 1000 slow, up to `governorHotMilli`. */
  speedMilli: number;
  /** Taps landed by each seat, nought up to `GOVERNOR_RUN`. */
  taps: [number, number];
  /** Shots the hub has taken. */
  hits: number;
  /** Whether the hub is lit to be shot. */
  hubLit: boolean;
  /** The pads each seat holds down, a mask of `GOVERNOR_PADS` bits. */
  padsDown: [number, number];
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

/** Whether the lit step asks for the needle tapped: a tap or a retap. */
export function governorTapping(s: GovernorState): boolean {
  const ask = governorLitStep(s)?.ask;
  return ask === "tap" || ask === "retap";
}

/** The seat that taps the lit step, or null when no tap is asked. */
export function governorTapper(s: GovernorState): 1 | 2 | null {
  return governorTapping(s) ? (governorLitStep(s)?.tapper ?? null) : null;
}

/** The seat that holds the brake in the lit step — the one that is not tapping — or null. */
export function governorGovernor(s: GovernorState): 1 | 2 | null {
  const tapper = governorTapper(s);
  return tapper === null ? null : tapper === 1 ? 2 : 1;
}

/** Whether a seat's chord is whole: both its pads down. */
export function governorChordWhole(s: GovernorState, side: 0 | 1): boolean {
  return (s.padsDown[side] & WHOLE) === WHOLE;
}

/**
 * Whether the needle is being eased back to 1×: the lit step's governing
 * seat holds its chord whole, or no step asks anybody to — the flyweights
 * settle on their own between steps.
 */
export function governorBraked(s: GovernorState): boolean {
  const governor = governorGovernor(s);
  return governor === null || governorChordWhole(s, governor === 1 ? 0 : 1);
}

/** How far the needle is from the lit mark, the short way round, thousandths of a turn; null with no mark lit. */
export function governorOffMark(s: GovernorState): number | null {
  const step = governorLitStep(s);
  if (step === null || !governorTapping(s)) return null;
  const apart = Math.abs(s.needleMilli - step.markMilli) % GOVERNOR_TURN_MILLI;
  return Math.min(apart, GOVERNOR_TURN_MILLI - apart);
}

/** Whether the needle is on the lit mark this instant. */
export function governorOnMark(world: World, s: GovernorState): boolean {
  const off = governorOffMark(s);
  return off !== null && off <= world.cfg.governorMarkMilli;
}

/** Whether a fire step is lit and the hub lit, so a shot may land. */
export function governorFiring(s: GovernorState): boolean {
  return s.hubLit && governorLitStep(s)?.ask === "fire";
}

/** The flyweights flown wide and the needle stalled: the fight is over. */
export function governorDone(s: GovernorState): boolean {
  return s.phase === "spent";
}

/** A fresh governor: the needle at the top, slow, nothing landed, no pad or thumb down. */
export function freshGovernor(beat: number, steps: readonly GovernorStep[]): GovernorState {
  return {
    kind: "governor",
    steps: steps.map((step) => ({ ...step })),
    phase: "slack",
    phaseBeat: beat,
    cursor: 0,
    needleMilli: 0,
    speedMilli: 1000,
    taps: [0, 0],
    hits: 0,
    hubLit: false,
    padsDown: [0, 0],
    tapDown: [false, false],
  };
}
