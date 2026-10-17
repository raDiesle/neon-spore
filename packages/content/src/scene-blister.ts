import {
  type BlisterGesture,
  blisterPlaceRow,
  gestureLengthMilli,
  type SimConfig,
  ticksPerBeat,
} from "@neon-spore/sim";
import type { SceneAct } from "./scene-act-types.js";
import { actCol } from "./scene-script.js";
import type { GuideScene } from "./scene-types.js";
import type { WaveEntry } from "./wave-types.js";

/**
 * **A hand on a blister**: THE BLISTER's seven gestures, as one path a
 * fingertip follows and the commands that path sends (`sim/blister.ts`).
 *
 * The owner, 17 October 2026: *for every single "controls" brush introduced
 * wave, we need to have individual tutorial … a hand should show the finger
 * movement action the player needs to do.* So the act names a seat and a
 * column and nothing else — `{ tick, blister: 2, col, until? }` — and the
 * gesture and its way are **the arrival's**, read off the blister the film
 * sent into that column, the way a tile's seat is the arrival's
 * (`SpawnEntry.sees`). A film cannot put a swipe on a body that wants a turn.
 *
 * **One path, two readers.** `blisterHandAt` is where the fingertip is and
 * whether it is down, tick by tick; `blisterCommands` samples the same path
 * (`scene-blister-commands.ts`)
 * into what a real thumb sends, and the ghost hand (`render/guide-finger.ts`)
 * draws the same path. The hand cannot show a stroke the world never felt.
 */

/** How long a tap's press is down, in ticks. */
const PRESS_TICKS = 10;
/** How long a carry takes to reach the end of its travel, in ticks. */
const CARRY_TICKS = 36;
/** Ticks between two reversals of a rub: four a second at 120 ticks. */
export const RUB_TICKS = 30;
/** How far a rub carries either side of the body, in thousandths of a tile. */
const RUB_REACH = 450;
/** How long a turn takes to go once round, in ticks. */
const TURN_TICKS = 72;
/** How often a carry or a turn reports where the hand is. */
export const SAMPLE_TICKS = 4;
/** Ticks between a combo's press and the start of its pull. */
export const COMBO_GAP = 24;
/** A swipe carries this much past its length, so the stroke is seen to count. */
const OVERSHOOT = 1.1;

/** Where the fingertip is, from the body's centre, and whether it is down. */
export interface BlisterHand {
  down: boolean;
  /** Across, in thousandths of a tile; right is positive. */
  xMilli: number;
  /** Down the screen, in thousandths of a tile. */
  yMilli: number;
  /** On a turn, where round the ring the tip is, in thousandths of a turn
   * clockwise from the top; the drawing turns it into a place on the ring. */
  bearing?: number;
}

/** The arrival an act's hand is on, with what the hand needs to know of it. */
export interface BlisterTarget {
  gesture: BlisterGesture;
  way: NonNullable<WaveEntry["way"]> | undefined;
  /** The field's column and row the body stands on. */
  col: number;
  row: number;
  /** One blow's length, in the gesture's thousandths. */
  lengthMilli: number;
  /** How far down its groove a lever is carried: the middle of the band. */
  leverMilli: number;
  /** A HOLD's or a LEVER's one blow, in ticks (`blisterHoldTicksOf`). */
  holdTicks: number;
}

/**
 * The blister an act is on: the latest one the film sent into its column at
 * or before the act's tick. Null when there is none, which a scene test
 * refuses — an act on nothing is an authoring mistake.
 */
export function blisterTarget(
  scene: GuideScene,
  act: SceneAct,
  cfg: SimConfig,
): BlisterTarget | null {
  const col = actCol(act, cfg.cols);
  const tpb = ticksPerBeat({ ...cfg, bpm: scene.bpm });
  let found: WaveEntry | null = null;
  for (const e of scene.entries) {
    if (e.kind !== "blister" || actCol({ tick: 0, col: e.col }, cfg.cols) !== col) continue;
    if ((e.beat ?? 0) * tpb > act.tick) continue;
    if (!found || (e.beat ?? 0) >= (found.beat ?? 0)) found = e;
  }
  if (!found) return null;
  const gesture = found.gesture ?? "tap";
  const lengthMilli = found.lengthMilli ?? gestureLengthMilli(cfg, gesture);
  return {
    gesture,
    way: found.way,
    col,
    row: blisterPlaceRow(cfg, found.row),
    lengthMilli,
    leverMilli: Math.round((cfg.blisterLeverFromMilli + cfg.blisterLeverToMilli) / 2),
    holdTicks: Math.round((lengthMilli * tpb) / 1000),
  };
}

/**
 * The tick the hand lifts: the gesture's own, a little after the blow it
 * deals, so a page shows the whole of one and nothing a film could mistime.
 */
export function blisterLift(act: SceneAct, t: BlisterTarget): number {
  return act.tick + LIFT[t.gesture](t);
}

/** Ticks from the hand going down to it lifting, by gesture. */
const LIFT: Record<BlisterGesture, (t: BlisterTarget) => number> = {
  tap: () => PRESS_TICKS,
  hold: (t) => t.holdTicks + 16,
  swipe: () => CARRY_TICKS + 8,
  turn: (t) => Math.round((TURN_TICKS * t.lengthMilli) / 1000) + 8,
  rub: () => Math.round(RUB_TICKS * 1.5) + 4,
  combo: () => COMBO_GAP + CARRY_TICKS + 8,
  lever: (t) => CARRY_TICKS + t.holdTicks + 12,
};

/** The fingertip at `tick`, or null while the hand is not down. */
export function blisterHandAt(act: SceneAct, t: BlisterTarget, tick: number): BlisterHand | null {
  const lift = blisterLift(act, t);
  if (tick < act.tick || tick >= lift) return null;
  const since = tick - act.tick;
  switch (t.gesture) {
    case "tap":
    case "hold":
      return { down: true, xMilli: 0, yMilli: 0 };
    case "swipe":
      return carried(t, since);
    case "combo":
      if (since < PRESS_TICKS) return { down: true, xMilli: 0, yMilli: 0 };
      if (since < COMBO_GAP) return { down: false, xMilli: 0, yMilli: 0 };
      return carried({ ...t, way: "right" }, since - COMBO_GAP);
    case "lever": {
      const k = Math.min(1, since / CARRY_TICKS);
      return { down: true, xMilli: 0, yMilli: Math.round(leverDepth(t) * ease(k)) };
    }
    case "rub":
      return { down: true, xMilli: rubAt(since), yMilli: 0 };
    case "turn": {
      // Round at a turn every `TURN_TICKS`, a little past the length a blow is.
      const travel = Math.min(t.lengthMilli * 1.08, (since * 1000) / TURN_TICKS);
      const sign = t.way === "ccw" ? -1 : 1;
      const bearing = (((sign * Math.round(travel)) % 1000) + 1000) % 1000;
      return { down: true, xMilli: 0, yMilli: 0, bearing };
    }
  }
}

/** The lever is carried to the middle of its band (`sim/blister-lever.ts`). */
const leverMiddle = 825;
function leverDepth(_t: BlisterTarget): number {
  return leverMiddle;
}

function carried(t: BlisterTarget, since: number): BlisterHand {
  const k = Math.min(1, since / CARRY_TICKS);
  const far = Math.round(t.lengthMilli * OVERSHOOT * ease(k));
  const way = t.way ?? "right";
  if (way === "left") return { down: true, xMilli: -far, yMilli: 0 };
  if (way === "up") return { down: true, xMilli: 0, yMilli: -far };
  if (way === "down") return { down: true, xMilli: 0, yMilli: far };
  return { down: true, xMilli: far, yMilli: 0 };
}

/** A triangle either side of the body, turning back every `RUB_TICKS`. */
function rubAt(since: number): number {
  const half = RUB_TICKS / 2;
  const p = (since + half) % (RUB_TICKS * 2);
  const k = p < RUB_TICKS ? p / RUB_TICKS : 2 - p / RUB_TICKS;
  return Math.round(RUB_REACH * (2 * k - 1));
}

/** Fast off the mark and slowing into the end, the way a thumb carries. */
function ease(k: number): number {
  return k * (2 - k);
}
