import type { Point } from "@neon-spore/content";
import { RUB_TURN } from "../../../packages/render/src/rub.js";
import { BEAT_SECONDS, FRESH_AFTER, HOLD_AT, HOLD_GRAB, HOLD_R } from "./hold-lab-rule.js";
import { LAB_TILE } from "./pull-lab-shapes.js";

/**
 * **The one generic RUB, as THE RUB LAB plays it** — the owner, 13 October
 * 2026: *for me "controls" "on the field" to "rub" is a special separate
 * category of way of control. which we need a special visual for it. also
 * build me a lab for it.* One mark in the middle of the empty field, in the
 * hold's place and at its size, as THE PRESS LAB's is; it asks a number of
 * **turns** (`RubAsk`) — a thumb going back and forth over it, counted each
 * time it turns back, the way the game counts every rub (`render/rub-turns.ts`).
 *
 * - **a rub begins on the mark**: a thumb put down off it is nothing, and one
 *   put down on it counts wherever it then goes, as the game's does;
 * - **a turn is the thumb coming back `TURN`** from the furthest its stroke
 *   reached, along the axis its first `TURN` set — any way, across or up and down;
 * - **a lift does not lose the count**: the next stroke goes on from it;
 * - **a gap of `LAPSE` without a turn loses it, red** — a thumb resting still
 *   on the mark included;
 * - **BOTH AT ONCE** (`RubSeats`): a turn counts only while the other seat is
 *   rubbing too, turned within `TOGETHER` — the owner the same day, on THE
 *   CHOIR: *related player ( or both) needs to use it at the same time*. The
 *   other seat is the lab's own (`partner` below); a turn made alone counts
 *   nothing, and is shown;
 * - **a count is never carried home**: the mark is removed where it was
 *   (FIZZ), and a fresh one comes in once the hand is off.
 *
 * Seconds, not ticks: the director's own clock, and nothing here is stored by
 * the game.
 */

/** How many turns a mark asks: the lab's TURNS picker. */
export interface RubAsk {
  key: string;
  label: string;
  turns: number;
}

export const RUB_ASKS: readonly RubAsk[] = [
  { key: "4", label: "4 TURNS", turns: 4 },
  { key: "8", label: "8 TURNS", turns: 8 },
  { key: "16", label: "16 TURNS", turns: 16 },
];

export const rubAsk = (key: string): RubAsk =>
  RUB_ASKS.find((a) => a.key === key) ?? (RUB_ASKS[1] as RubAsk);

/** Who rubs: one seat, or both together. */
export type RubSeats = "one" | "both";

export const RUB_SEATS: readonly [string, RubSeats][] = [
  ["ONE SEAT", "one"],
  ["BOTH AT ONCE", "both"],
];

export const RUB_AT: Point = HOLD_AT;
export const RUB_R = HOLD_R;
/** How far back a thumb comes before it has turned: the game's `RUB_TURN` of a tile. */
export const TURN = RUB_TURN * LAB_TILE;
/** Seconds without a turn, once one has counted, that lose the count: two beats. */
export const LAPSE = 2 * BEAT_SECONDS;
/** Seconds since the other seat's last turn inside which it is still rubbing: one beat. */
export const TOGETHER = BEAT_SECONDS;
/** Seconds a verdict is shown. */
export const VERDICT_SECONDS = 0.9;

export type RubVerdict = "counted" | "lapsed";

export interface LabRub {
  /** Turns counted on this mark so far. */
  done: number;
  /** A finger is on the field, and whether it went down on the mark. */
  down: boolean;
  onIt: boolean;
  /** The finger's offset from where it took the mark, for the drop to lean after. */
  offset: Point;
  /** Where the current stroke is measured from, its axis once set, how far it has
   * got, and which way it runs. */
  from: Point;
  axis: Point | null;
  reach: number;
  sense: 1 | -1;
  verdict: RubVerdict | null;
  since: number;
  age: number;
  last: RubVerdict | null;
  /** The turns there were when that verdict came. */
  had: number;
  counted: number;
  lapsed: number;
  /** Rubs begun off the mark. */
  missed: number;
  /** Turns made while the other seat was not rubbing: counted nothing. */
  alone: number;
  /** Seconds since the last turn that counted, and since the last made alone. */
  turned: number;
  lonely: number;
  /** Seconds since the other seat last turned (BOTH AT ONCE). */
  partner: number;
  born: number;
  waiting: boolean;
}

/** Seconds since something that never happened. */
const NEVER = 60;

export function freshRub(): LabRub {
  return {
    done: 0,
    down: false,
    onIt: false,
    offset: { x: 0, y: 0 },
    from: { x: 0, y: 0 },
    axis: null,
    reach: 0,
    sense: 1,
    verdict: null,
    since: 0,
    age: NEVER,
    last: null,
    had: 0,
    counted: 0,
    lapsed: 0,
    missed: 0,
    alone: 0,
    turned: NEVER,
    lonely: NEVER,
    partner: NEVER,
    born: 0,
    waiting: false,
  };
}

function give(h: LabRub, v: RubVerdict): void {
  h.verdict = v;
  h.last = v;
  h.since = 0;
  h.age = 0;
  h.had = h.done;
}

export const onMark = (at: Point): boolean =>
  Math.hypot(at.x - RUB_AT.x, at.y - RUB_AT.y) <= RUB_R * HOLD_GRAB;

/** Whether the other seat is rubbing now, as far as a turn of this one is concerned. */
export const together = (h: LabRub, seats: RubSeats): boolean =>
  seats === "one" || h.partner < TOGETHER;

/** A finger down. It takes the mark only on it, and only while there is one. */
export function press(h: LabRub, at: Point): boolean {
  if (h.down) return false;
  h.down = true;
  h.onIt = !h.waiting && onMark(at);
  if (!h.waiting && !h.onIt) h.missed++;
  h.from = at;
  h.axis = null;
  h.reach = 0;
  h.sense = 1;
  h.offset = { x: 0, y: 0 };
  return h.onIt;
}

/** The finger moved: whether it has just turned back, and the turn counted. */
export function move(h: LabRub, ask: RubAsk, seats: RubSeats, at: Point, grab: Point): boolean {
  if (!h.down || !h.onIt || h.waiting) return false;
  h.offset = { x: at.x - grab.x, y: at.y - grab.y };
  const dx = at.x - h.from.x;
  const dy = at.y - h.from.y;
  if (h.axis === null) {
    const d = Math.hypot(dx, dy);
    if (d < TURN) return false;
    h.axis = { x: dx / d, y: dy / d };
  }
  const along = (dx * h.axis.x + dy * h.axis.y) * h.sense;
  if (along > h.reach) h.reach = along;
  if (along > h.reach - TURN) return false;
  h.from = at;
  h.reach = 0;
  h.sense = h.sense === 1 ? -1 : 1;
  if (!together(h, seats)) {
    h.alone++;
    h.lonely = 0;
    return false;
  }
  h.done++;
  h.turned = 0;
  h.verdict = null;
  if (h.last !== "counted") h.last = null;
  if (h.done >= ask.turns) {
    give(h, "counted");
    h.counted++;
    h.waiting = true;
    h.onIt = false;
  }
  return true;
}

export function lift(h: LabRub): void {
  h.down = false;
  h.onIt = false;
  h.offset = { x: 0, y: 0 };
}

/** The other seat turned. */
export function partnerTurn(h: LabRub): void {
  h.partner = 0;
}

/** How near the turns are to lapsing, 0 just turned to 1 at `LAPSE`; 0 with none yet. */
export function nearLapse(h: LabRub): number {
  if (h.done === 0 || h.waiting) return 0;
  return Math.min(1, h.turned / LAPSE);
}

/** The clock: a gap too long lapses, a verdict fades, a fresh mark comes in. */
export function tick(h: LabRub, dt: number): void {
  h.age += dt;
  h.turned += dt;
  h.lonely += dt;
  h.partner += dt;
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
  if (h.done > 0 && h.turned >= LAPSE) {
    give(h, "lapsed");
    h.lapsed++;
    h.done = 0;
  }
}
