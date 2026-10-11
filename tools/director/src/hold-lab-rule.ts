import type { Point } from "@neon-spore/content";
import { LAB_H, LAB_TILE, LAB_W } from "./pull-lab-shapes.js";

/**
 * **The one generic HOLD, as the HOLD LAB plays it** — the PULL LAB's rule
 * (`pull-lab-rule.ts`) for a thumb that stays put instead of travelling. One
 * mark in the middle of the empty field; the thumb goes down on it and stays
 * for the beats it asks (`HoldAsk`), and the hold is counted the moment they
 * are done. The owner's picks for the pull carried over, so the two controls
 * answer alike:
 *
 * - **a lift before the beats are done is refused, red** — *short · red*;
 * - **a thumb that slides half a tile off the mark fails** — *off path ·
 *   fails past 1/2 tile*;
 * - **a tap is never refused**: a lift inside `TAP` seconds is nothing;
 * - **a count is never carried home**: the mark is removed where it was
 *   (FIZZ), and a fresh one comes in once the hand is off.
 *
 * Seconds, not ticks: the director's own clock, and nothing here is stored by
 * the game.
 */

/** Seconds a beat lasts at the game's 96 beats a minute (`SimConfig.bpm`). */
export const BEAT_SECONDS = 60 / 96;

/** How long a hold asks to be held: the lab's HOLD FOR picker. */
export interface HoldAsk {
  key: string;
  label: string;
  beats: number;
}

export const HOLD_ASKS: readonly HoldAsk[] = [
  { key: "1", label: "1 BEAT", beats: 1 },
  { key: "2", label: "2 BEATS", beats: 2 },
  { key: "4", label: "4 BEATS", beats: 4 },
];

export const holdAsk = (key: string): HoldAsk =>
  HOLD_ASKS.find((a) => a.key === key) ?? (HOLD_ASKS[1] as HoldAsk);

/** The mark's radius: the game's own hold mark, nine tenths of a cue frame's
 * shorter half (`HOLD_MARK_R`, `CUE_FRAME`) — six tenths of a tile. */
export const HOLD_R = LAB_TILE * 0.6;
/** Where the mark sits: the middle of the field. */
export const HOLD_AT: Point = { x: LAB_W / 2, y: LAB_H / 2 };
/** A press counts as on the mark inside this many of its radii. */
export const HOLD_GRAB = 1.5;
/** The thumb fails once it is this far from the mark's middle: half a tile past its rim. */
export const SLIP_REACH = HOLD_R + LAB_TILE * 0.5;
/** A lift sooner than this after the press is a tap, never refused. */
const TAP = 0.15;
/** Seconds a verdict is shown. */
export const VERDICT_SECONDS = 0.9;
/** Seconds after a count before a fresh mark may come in, the hand being off. */
export const FRESH_AFTER = 0.45;

export type HoldVerdict = "counted" | "refused" | "slipped";

export interface LabHold {
  /** `done` is counted with the hand still down: nothing more until it lifts. */
  phase: "idle" | "held" | "done";
  /** How much of the hold is done, 0..1. */
  fill: number;
  verdict: HoldVerdict | null;
  /** Seconds since the verdict while it is shown; `age` keeps counting after. */
  since: number;
  age: number;
  /** The last verdict given, kept until the next press. */
  last: HoldVerdict | null;
  /** The fill and where the thumb was when that verdict came. */
  from: { fill: number; off: Point };
  /** The thumb's offset from the mark's middle while it is down. */
  off: Point;
  counted: number;
  refused: number;
  slipped: number;
  /** Seconds since the mark was last taken, and last let go. */
  grabbed: number;
  lifted: number;
  /** Seconds since this mark came in: the lab opened, RETRY, or a fresh one after a count. */
  born: number;
  /** Counted, and its fresh mark has not come in yet: nothing to press. */
  waiting: boolean;
}

/** Seconds since something that never happened. */
const NEVER = 60;

export function freshHold(): LabHold {
  return {
    phase: "idle",
    fill: 0,
    verdict: null,
    since: 0,
    age: NEVER,
    last: null,
    from: { fill: 0, off: { x: 0, y: 0 } },
    off: { x: 0, y: 0 },
    counted: 0,
    refused: 0,
    slipped: 0,
    grabbed: NEVER,
    lifted: NEVER,
    born: 0,
    waiting: false,
  };
}

function give(h: LabHold, v: HoldVerdict): void {
  h.verdict = v;
  h.last = v;
  h.since = 0;
  h.age = 0;
  h.from = { fill: h.fill, off: { ...h.off } };
}

/** Pressed: taken if on the mark and there is a mark to take. */
export function press(h: LabHold, at: Point): boolean {
  if (h.phase !== "idle" || h.waiting) return false;
  const off = { x: at.x - HOLD_AT.x, y: at.y - HOLD_AT.y };
  if (Math.hypot(off.x, off.y) > HOLD_R * HOLD_GRAB) return false;
  h.phase = "held";
  h.off = off;
  h.fill = 0;
  h.grabbed = 0;
  h.verdict = null;
  // A failure shown ends here; the last count's FIZZ plays out under the fresh mark.
  if (h.last !== "counted") h.last = null;
  return true;
}

export function move(h: LabHold, at: Point): void {
  if (h.phase === "idle") return;
  h.off = { x: at.x - HOLD_AT.x, y: at.y - HOLD_AT.y };
  if (h.phase !== "held" || Math.hypot(h.off.x, h.off.y) <= SLIP_REACH) return;
  give(h, "slipped");
  h.slipped++;
  h.phase = "idle";
  h.fill = 0;
  h.lifted = 0;
}

export function lift(h: LabHold): void {
  if (h.phase === "idle") return;
  const was = h.phase;
  h.phase = "idle";
  h.lifted = 0;
  if (was === "done") return;
  if (h.grabbed >= TAP) {
    give(h, "refused");
    h.refused++;
  }
  h.fill = 0;
}

/** How near the thumb is to slipping off, 0 on the middle to 1 at the limit. */
export function nearSlip(h: LabHold): number {
  if (h.phase === "idle") return 0;
  const d = Math.hypot(h.off.x, h.off.y);
  return Math.max(0, Math.min(1, (d - HOLD_R * 0.6) / (SLIP_REACH - HOLD_R * 0.6)));
}

/** The clock: a held mark fills, a verdict fades, a fresh mark comes in. */
export function tick(h: LabHold, ask: HoldAsk, dt: number): void {
  h.age += dt;
  h.grabbed += dt;
  h.lifted += dt;
  h.born += dt;
  if (h.verdict) {
    h.since += dt;
    if (h.since > VERDICT_SECONDS && h.phase !== "done") h.verdict = null;
  }
  if (h.waiting && h.phase === "idle" && h.age >= FRESH_AFTER) {
    h.waiting = false;
    h.born = 0;
  }
  if (h.phase !== "held") return;
  h.fill = Math.min(1, h.fill + dt / (ask.beats * BEAT_SECONDS));
  if (h.fill < 1) return;
  give(h, "counted");
  h.counted++;
  h.phase = "done";
  h.waiting = true;
}
