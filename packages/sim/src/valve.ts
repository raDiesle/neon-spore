import { bearingApart, NO_BEARING } from "./bearing.js";
import type { SimConfig } from "./config.js";
import { NO_SPARK } from "./mantle.js";
import type { World } from "./world.js";

/**
 * THE VALVE: a squat drum standing over the field with one wheel in its face
 * and a pin beside it, and **the boss that asks whether one hand can stop what
 * the other is moving** (`docs/spec/bosses-choreographed.md` §25).
 *
 * The pilot turns the wheel onto its mark. While it sits there the navigator
 * taps the pin, which freezes the wheel dead — `FreezeTap`, the one new verb
 * on either brief — and only a frozen wheel lets the pin be pulled, by either
 * thumb. Both screens draw the same drum.
 *
 * **The rule is one sentence**: turn the wheel onto the mark, tap to freeze
 * it, then pull the pin before it thaws.
 *
 * **Its health is the three pins.** Each comes out in its own movement, the
 * windows shorter each time, and the third movement's mark only counts once
 * the wheel has gone a full lap (`valveLapMilli`) — row 9's long way round.
 *
 * **One ordinary hazard, once.** The first pin out leaks a spark down the
 * drum's column, shot out in either colour inside `valveSparkBeats`
 * (`valve-shot.ts`), or it reaches the hull, which is the wave.
 */

/**
 * The pins in the drum at the top of the fight — the health, and a figure of
 * the silhouette rather than a tuning, `HASP_COUNT`'s reason: a drum with four
 * pins is a different drum.
 */
export const VALVE_PINS = 3;

/**
 * Where the scene is: settling, the wheel to be turned, the wheel on its mark
 * and the freeze window open, frozen and the pin to be pulled, the drum listing
 * after a pin, and the face fallen open — with the story between the pins
 * (`valve-story.ts`): the first socket's jet, the drum's shudder braced, the
 * film wiped off the face, and the bare seal strained.
 */
export const VALVE_PHASES = [
  "still",
  "turn",
  "hold",
  "frozen",
  "list",
  "jet",
  "brace",
  "wipe",
  "seal",
  "open",
] as const;
export type ValvePhase = (typeof VALVE_PHASES)[number];

/** What a wave authors: the wheel's mark in each movement, as a bearing. */
export interface ValveEntry {
  kind: "valve";
  /** One bearing per movement, in thousandths of a turn clockwise from the
   * top. Past the third they are never read. */
  marks: readonly number[];
}

export interface ValveState {
  kind: "valve";
  /** Copied at install, each brought inside a turn, and never written again. */
  marks: number[];
  phase: ValvePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** 1, 2 or 3: which pin the drum is on. */
  movement: 1 | 2 | 3;
  /** Pins still in: `VALVE_PINS` down to nought. */
  pins: number;
  /** Where the wheel stands, in thousandths of a turn. */
  wheelMilli: number;
  /** Where the pilot's hand last reported, `NO_BEARING` while it is off. */
  handMilli: number;
  /** How far the wheel has been turned since this movement's turn began, and
   * which way: signed, so a hand working it back and forth gets nowhere. */
  travelMilli: number;
  /** Whether each seat's thumb is down on the pin, P1's first — what makes a
   * tap an edge rather than a level, and what the brace and the seal count. */
  held: [boolean, boolean];
  /** Beats in a row both thumbs have held the pin, in the brace or the seal. */
  chordBeats: number;
  /** The last reversal count each seat's rub reported (`valve-hand.ts`). */
  rubs: [number, number];
  /** Reversals rubbed into this film so far, up to `valveWipeRubs`. */
  wiped: number;
  /** The column the spark falls in, `NO_SPARK` while none is loose. */
  sparkCol: number;
  /** `world.beat` the spark leaked. */
  sparkBeat: number;
}

export function valveBoss(world: World): ValveState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "valve" ? boss : null;
}

/** The mark this movement's wheel is turned onto. */
export function valveMark(s: ValveState): number {
  return s.marks[s.movement - 1] ?? 0;
}

/** How far the wheel must travel before this movement's mark counts: a full
 * lap in the third, nothing before it. */
export function valveNeedMilli(s: ValveState, cfg: SimConfig): number {
  return s.movement === 3 ? cfg.valveLapMilli : 0;
}

/** Whether the wheel sits on its mark, and has come far enough for it to count. */
export function valveOnMark(s: ValveState, cfg: SimConfig): boolean {
  if (Math.abs(s.travelMilli) < valveNeedMilli(s, cfg)) return false;
  return bearingApart(s.wheelMilli, valveMark(s)) <= cfg.valveNearMilli;
}

/** Whether the wheel answers the pilot's hand at all: only while it is being
 * turned or held on its mark — never frozen, which is the whole of a freeze. */
export function valveTurning(s: ValveState): boolean {
  return s.phase === "turn" || s.phase === "hold";
}

/** Whether the freeze window is open and the navigator's tap would land. */
export function valveHolding(s: ValveState): boolean {
  return s.phase === "hold";
}

/** Whether the wheel is frozen and the pin may be pulled. */
export function valveFrozen(s: ValveState): boolean {
  return s.phase === "frozen";
}

/** Whether the spark is loose and there is something to shoot. */
export function valveLeaking(s: ValveState): boolean {
  return s.sparkCol !== NO_SPARK;
}

/** Whether the first socket's jet is blowing and a tap on the pin caps it. */
export function valveJetting(s: ValveState): boolean {
  return s.phase === "jet";
}

/** Whether the drum shudders, or its bare seal strains: both thumbs to hold the pin. */
export function valveBracing(s: ValveState): boolean {
  return s.phase === "brace" || s.phase === "seal";
}

/** Whether the film is on the face and a rub on the pin wipes it. */
export function valveWiping(s: ValveState): boolean {
  return s.phase === "wipe";
}

/** The face fallen open: the fight is over and the drum is only hanging. */
export function valveDone(s: ValveState): boolean {
  return s.phase === "open";
}

/** A fresh drum: every pin in, the wheel at the top and nobody's hand on it. */
export function freshValve(beat: number, marks: readonly number[]): ValveState {
  return {
    kind: "valve",
    marks: marks.map((m) => ((Math.round(m) % 1000) + 1000) % 1000),
    phase: "still",
    phaseBeat: beat,
    movement: 1,
    pins: VALVE_PINS,
    wheelMilli: 0,
    handMilli: NO_BEARING,
    travelMilli: 0,
    held: [false, false],
    chordBeats: 0,
    rubs: [0, 0],
    wiped: 0,
    sparkCol: NO_SPARK,
    sparkBeat: 0,
  };
}
