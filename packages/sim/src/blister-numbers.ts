import type { SimConfig } from "./config.js";
import { ticksPerBeat } from "./config-derived.js";
import type { BlisterGesture, BlisterSpawn } from "./creature-state-blister.js";
import type { Creature } from "./types.js";

/**
 * **A blister's three numbers** — how many beats it stays up, how many blows it
 * takes, and how long one blow is — each the wave's for this one body when it
 * set it (`BlisterSpawn`), and the gesture's default in `SimConfig` otherwise
 * (`config-blister.ts`). The owner, 16 October 2026: *let me able to configure
 * the timings/length/number of action required for each control.*
 *
 * Every reader of these asks here — the simulation's gestures, render's help
 * and the director — so a body set to a three-tile stroke is drawn, counted
 * and refused at three tiles, never at the default.
 */

/** The gestures that have a length, and what it measures: a HOLD's and a
 * LEVER's time in thousandths of a beat, a SWIPE's and a COMBO's stroke in
 * thousandths of a tile, a TURN's in thousandths of a turn. TAP and RUB have
 * none — a tap is a tap, and a reversal is a reversal. */
export type BlisterLength = "beat" | "tile" | "turn";

export function blisterLengthOf(gesture: BlisterGesture): BlisterLength | undefined {
  if (gesture === "hold" || gesture === "lever") return "beat";
  if (gesture === "swipe" || gesture === "combo") return "tile";
  return gesture === "turn" ? "turn" : undefined;
}

/** The gesture's default up beats. */
export function gestureUpBeats(cfg: SimConfig, gesture: BlisterGesture): number {
  return cfg[UP_BEATS[gesture]];
}

/** The gesture's default blows. */
export function gestureBlows(cfg: SimConfig, gesture: BlisterGesture): number {
  return cfg[BLOWS[gesture]];
}

/** The gesture's default length, in its own thousandths; 0 for one with none. */
export function gestureLengthMilli(cfg: SimConfig, gesture: BlisterGesture): number {
  const key = (LENGTH as Partial<Record<BlisterGesture, (typeof LENGTH)[keyof typeof LENGTH]>>)[
    gesture
  ];
  return key === undefined ? 0 : cfg[key];
}

/** Which `SimConfig` field holds each default — the director's numbers page
 * reads the same table, so a row there is the field the game reads. */
export const UP_BEATS = {
  tap: "blisterTapUpBeats",
  hold: "blisterHoldUpBeats",
  swipe: "blisterSwipeUpBeats",
  turn: "blisterTurnUpBeats",
  rub: "blisterRubUpBeats",
  combo: "blisterComboUpBeats",
  lever: "blisterLeverUpBeats",
} as const satisfies Record<BlisterGesture, keyof SimConfig>;

export const BLOWS = {
  tap: "blisterTapBlows",
  hold: "blisterHoldBlows",
  swipe: "blisterSwipeBlows",
  turn: "blisterTurnBlows",
  rub: "blisterRubBlows",
  combo: "blisterComboBlows",
  lever: "blisterLeverBlows",
} as const satisfies Record<BlisterGesture, keyof SimConfig>;

export const LENGTH = {
  hold: "blisterHoldMilli",
  swipe: "blisterSwipeMilli",
  turn: "blisterTurnMilli",
  combo: "blisterComboMilli",
  lever: "blisterLeverHoldMilli",
} as const satisfies Partial<Record<BlisterGesture, keyof SimConfig>>;

/**
 * What a blister carries of the wave's three numbers: only those the wave set,
 * each at least 1, so a body left at the defaults is byte-for-byte the body it
 * always was. A length on a gesture that has none is dropped.
 */
export function blisterNumbersOnSpawn(
  gesture: BlisterGesture,
  entry: BlisterSpawn,
): Partial<Creature> {
  const { upBeats, blows, lengthMilli } = entry;
  return {
    ...(upBeats === undefined ? {} : { blisterUpBeats: atLeastOne(upBeats) }),
    ...(blows === undefined ? {} : { blisterBlows: atLeastOne(blows) }),
    ...(lengthMilli === undefined || blisterLengthOf(gesture) === undefined
      ? {}
      : { blisterLengthMilli: atLeastOne(lengthMilli) }),
  };
}

function atLeastOne(n: number): number {
  return Math.max(1, Math.round(n));
}

function gestureOf(c: Creature): BlisterGesture {
  return c.blisterGesture ?? "tap";
}

/** Beats this body stays up. */
export function blisterUpBeatsOf(cfg: SimConfig, c: Creature): number {
  return c.blisterUpBeats ?? gestureUpBeats(cfg, gestureOf(c));
}

/** Blows this body takes before it is gone. */
export function blisterBlowsOf(cfg: SimConfig, c: Creature): number {
  return c.blisterBlows ?? gestureBlows(cfg, gestureOf(c));
}

/** Blows still owed: what a count drawn on it says. */
export function blisterBlowsLeft(cfg: SimConfig, c: Creature): number {
  return Math.max(0, blisterBlowsOf(cfg, c) - (c.blisterBlowsDone ?? 0));
}

/** One blow's length on this body, in its gesture's thousandths. */
export function blisterLengthMilliOf(cfg: SimConfig, c: Creature): number {
  return c.blisterLengthMilli ?? gestureLengthMilli(cfg, gestureOf(c));
}

/** A HOLD's or a LEVER's one blow, in ticks: never less than one. */
export function blisterHoldTicksOf(cfg: SimConfig, c: Creature): number {
  return Math.max(1, Math.round((blisterLengthMilliOf(cfg, c) * ticksPerBeat(cfg)) / 1000));
}
