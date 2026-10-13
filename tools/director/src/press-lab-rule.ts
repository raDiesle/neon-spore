import type { Point } from "@neon-spore/content";
import { BEAT_SECONDS, FRESH_AFTER, HOLD_AT, HOLD_GRAB, HOLD_R } from "./hold-lab-rule.js";

/**
 * **The one generic PRESS, as THE PRESS LAB plays it** — THE HOLD LAB's rule
 * (`hold-lab-rule.ts`) for a finger that comes down and goes away again. One
 * mark in the middle of the empty field, in the hold's place and at its size;
 * it asks to be pressed a number of times (`PressAsk`), and is counted on the
 * press that makes the number. The owner, 13 October 2026: *like "hold lab" i
 * want a "press" lab … it should ideally already indicate somehow how many
 * times roundabout it is required to tap/press*.
 *
 * - **the press is the down**: a press counts the moment it lands, and the
 *   lift only ends it (CONTROLS › PRESS: *the press is the down, and the lift
 *   only ends it*);
 * - **a resting thumb counts once**: to press again it has to lift and come
 *   down again — so holding it does nothing a press does not;
 * - **a press off the mark is nothing**, as a hold's is;
 * - **a gap of `LAPSE` between presses loses the count, red** — the press's
 *   *let go early*: a thumb left resting on the mark lapses too;
 * - **a count is never carried home**: the mark is removed where it was
 *   (FIZZ), and a fresh one comes in once the hand is off.
 *
 * Seconds, not ticks: the director's own clock, and nothing here is stored by
 * the game.
 */

/** How many presses a mark asks: the lab's PRESS picker. */
export interface PressAsk {
  key: string;
  label: string;
  times: number;
}

export const PRESS_ASKS: readonly PressAsk[] = [
  { key: "1", label: "ONCE", times: 1 },
  { key: "5", label: "5 TIMES", times: 5 },
  { key: "10", label: "10 TIMES", times: 10 },
];

export const pressAsk = (key: string): PressAsk =>
  PRESS_ASKS.find((a) => a.key === key) ?? (PRESS_ASKS[1] as PressAsk);

/** The mark is the hold's, where the hold's is: one drop, two gestures. */
export const PRESS_AT: Point = HOLD_AT;
export const PRESS_R = HOLD_R;
/** Seconds without a press, once one has landed, that lose the count: two beats. */
export const LAPSE = 2 * BEAT_SECONDS;
/** Seconds a verdict is shown. */
export const VERDICT_SECONDS = 0.9;

export type PressVerdict = "counted" | "lapsed";

export interface LabPress {
  /** Presses landed on this mark so far. */
  done: number;
  /** A finger is on the field, wherever it came down. */
  down: boolean;
  verdict: PressVerdict | null;
  /** Seconds since the verdict while it is shown; `age` keeps counting after. */
  since: number;
  age: number;
  /** The last verdict given, kept until the next press. */
  last: PressVerdict | null;
  /** The presses there were when that verdict came. */
  from: number;
  counted: number;
  lapsed: number;
  /** Presses that landed off the mark. */
  missed: number;
  /** Seconds since the last press landed on the mark. */
  pressed: number;
  /** Seconds since this mark came in: the lab opened, RETRY, or a fresh one after a count. */
  born: number;
  /** Counted, and its fresh mark has not come in yet: nothing to press. */
  waiting: boolean;
}

/** Seconds since something that never happened. */
const NEVER = 60;

export function freshPress(): LabPress {
  return {
    done: 0,
    down: false,
    verdict: null,
    since: 0,
    age: NEVER,
    last: null,
    from: 0,
    counted: 0,
    lapsed: 0,
    missed: 0,
    pressed: NEVER,
    born: 0,
    waiting: false,
  };
}

function give(h: LabPress, v: PressVerdict): void {
  h.verdict = v;
  h.last = v;
  h.since = 0;
  h.age = 0;
  h.from = h.done;
}

/** Whether `at` is on the mark: the hold's reach, `HOLD_GRAB` of its radius. */
export const onMark = (at: Point): boolean =>
  Math.hypot(at.x - PRESS_AT.x, at.y - PRESS_AT.y) <= PRESS_R * HOLD_GRAB;

/** A finger down: one press, if it is on the mark and there is a mark to press. */
export function press(h: LabPress, ask: PressAsk, at: Point): boolean {
  if (h.down) return false;
  h.down = true;
  if (h.waiting) return false;
  if (!onMark(at)) {
    h.missed++;
    return false;
  }
  h.done++;
  h.pressed = 0;
  h.verdict = null;
  // A lapse shown ends here; the last count's FIZZ plays out under the fresh mark.
  if (h.last !== "counted") h.last = null;
  if (h.done >= ask.times) {
    give(h, "counted");
    h.counted++;
    h.waiting = true;
  }
  return true;
}

export function lift(h: LabPress): void {
  h.down = false;
}

/** How near the presses are to lapsing, 0 just pressed to 1 at `LAPSE`; 0 with none yet. */
export function nearLapse(h: LabPress): number {
  if (h.done === 0 || h.waiting) return 0;
  return Math.min(1, h.pressed / LAPSE);
}

/** The clock: a gap too long lapses, a verdict fades, a fresh mark comes in. */
export function tick(h: LabPress, dt: number): void {
  h.age += dt;
  h.pressed += dt;
  h.born += dt;
  if (h.verdict) {
    h.since += dt;
    if (h.since > VERDICT_SECONDS) h.verdict = null;
  }
  if (h.waiting) {
    if (!h.down && h.age >= FRESH_AFTER) {
      h.waiting = false;
      h.done = 0;
      h.born = 0;
    }
    return;
  }
  if (h.done > 0 && h.pressed >= LAPSE) {
    give(h, "lapsed");
    h.lapsed++;
    h.done = 0;
  }
}
