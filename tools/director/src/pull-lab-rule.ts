import type { Point } from "@neon-spore/content";
import { PULL_GRAB, type PullTrack, pullTrackPoint } from "@neon-spore/render";
import { LAB_KNOB, LAB_TILE, type LabShape } from "./pull-lab-shapes.js";

/**
 * **The one generic PULL, as the lab plays it** — a toy rule beside the
 * twenty-odd the simulation keeps, one per boss (`docs/queue.md` has the
 * item that would make them this one). It holds the decisions the SUGGESTED
 * line asks for in one place, so they can be felt before they are taken:
 *
 * - **the direction is a field** (`LabShape.direction`), never a function;
 * - **a pull counts the moment it has gone the whole way**, once, and the
 *   knob stays there until the lift;
 * - **a short lift is one of two answers**, chosen on the lab's bar
 *   (`ShortPull`): refused, red, or ignored, the knob simply going home;
 * - **a thumb off the path** is ignored, as every pull in the game ignores it
 *   today, or fails past a tolerance (`Stray`) — the owner, 10 October 2026:
 *   *maybe every pull should allow for failure with some tolerance to pull
 *   away from the required path*, which would make TRACE ALONG A LINE a pull
 *   whose path bends (`docs/spec/ideas.md`, A pull along a path).
 *
 * Seconds, not ticks: this is the director's own clock, and nothing here is
 * stored by the game.
 */

export type ShortPull = "refuse" | "ignore";

/** What a thumb that leaves the path comes to: nothing, or a failure past
 * one tile or half a tile from it. */
export type Stray = "free" | "tile" | "half";

/** The tolerance either side of the path, in tiles; `null` is no limit. */
export const STRAY_TILES: Readonly<Record<Stray, number | null>> = {
  free: null,
  tile: 1,
  half: 0.5,
};

export type PullPhase = "idle" | "held" | "full" | "home";

export interface LabPull {
  phase: PullPhase;
  /** Where the knob is along the track, 0..1. */
  at: number;
  /** What the last lift came to, while it is still being shown. */
  verdict: "counted" | "refused" | "ignored" | "strayed" | null;
  /** Seconds since the verdict. */
  since: number;
  /** -1 or 1 once a two-way pull has gone one way; 0 before. */
  sign: -1 | 0 | 1;
  counted: number;
  refused: number;
  /** Pulls failed off the path; counted apart from the short ones. */
  strayed: number;
  /** How far off the path the hand has the knob, in field pixels: where it
   * was let go, kept while a failure is shown and brought home with it. */
  off: Point;
  /** The knob is on its way home from a failure, slowly, whatever the verdict shows. */
  slow: boolean;
  /** Seconds since the verdict, not restarted by the lift that follows a count. */
  age: number;
  /** Seconds the knob has rested at its start with no verdict shown; 0
   * while it is held or on its way home. */
  rested: number;
  /** The last verdict given, kept until the next press. */
  last: "counted" | "refused" | null;
}

/** Seconds a verdict is shown before the knob is idle again. */
export const VERDICT_SECONDS = 0.9;
/** How much of the way back the knob goes each second, as a rate. */
const SPRING = 14;
/** A failed pull goes home slower, so the eye follows it from where it was
 * let go — the owner, 10 October 2026: *moves back, not too quick*. */
const SPRING_FAILED = 3.2;
/** Seconds a failed knob stays where it was let go before it goes home. */
const FAILED_REST = 0.35;
/** Close enough to the end to be the whole way. */
const FULL = 0.985;

export function freshPull(shape: LabShape): LabPull {
  return {
    phase: "idle",
    at: shape.origin,
    verdict: null,
    since: 0,
    sign: 0,
    counted: 0,
    refused: 0,
    strayed: 0,
    off: { x: 0, y: 0 },
    slow: false,
    age: 0,
    rested: 0,
    last: null,
  };
}

export function knobAt(shape: LabShape, p: LabPull): Point {
  const q = pullTrackPoint(shape.track, p.at);
  return { x: q.x, y: q.y };
}

/** How much of the pull is done, 0..1, whichever way it went. */
export function progress(shape: LabShape, p: LabPull): number {
  if (shape.origin === 0) return p.at;
  return Math.min(1, Math.abs(p.at - shape.origin) / shape.origin);
}

/** Pressed: taken if within the game's own grab circle round the knob. */
export function press(shape: LabShape, p: LabPull, at: Point): boolean {
  if (p.phase === "held" || p.phase === "full") return false;
  const k = knobAt(shape, p);
  if (Math.hypot(at.x - k.x, at.y - k.y) > LAB_KNOB * PULL_GRAB) return false;
  p.phase = "held";
  p.verdict = null;
  p.slow = false;
  p.last = null;
  p.rested = 0;
  return true;
}

/** The nearest point of the track to `at`, searched near where the knob is
 * so a curve that doubles back is not jumped across, and how far off it the
 * thumb is. */
function nearest(t: PullTrack, from: number, at: Point): { k: number; off: number } {
  let best = from;
  let bestD = Number.POSITIVE_INFINITY;
  for (let i = 0; i <= 200; i++) {
    const k = i / 200;
    if (Math.abs(k - from) > 0.3) continue;
    const q = pullTrackPoint(t, k);
    const d = Math.hypot(q.x - at.x, q.y - at.y);
    if (d < bestD) {
      bestD = d;
      best = k;
    }
  }
  return { k: best, off: bestD };
}

export function move(shape: LabShape, p: LabPull, at: Point, stray: Stray = "free"): void {
  if (p.phase !== "held") return;
  const n = nearest(shape.track, p.at, at);
  const q = pullTrackPoint(shape.track, n.k);
  p.off = { x: at.x - q.x, y: at.y - q.y };
  const limit = STRAY_TILES[stray];
  if (limit !== null && n.off > limit * LAB_TILE) {
    // Off the path is a failure, wherever along it the knob had got to.
    p.phase = "home";
    p.verdict = "strayed";
    p.since = 0;
    p.age = 0;
    p.last = "refused";
    p.strayed++;
    p.slow = true;
    return;
  }
  p.at = n.k;
  if (shape.origin > 0 && p.sign === 0 && Math.abs(p.at - shape.origin) > 0.08)
    p.sign = p.at > shape.origin ? 1 : -1;
  if (progress(shape, p) >= FULL) {
    p.off = { x: 0, y: 0 };
    p.phase = "full";
    p.verdict = "counted";
    p.since = 0;
    p.age = 0;
    p.last = "counted";
    p.counted++;
  }
}

export function lift(shape: LabShape, p: LabPull, short: ShortPull): void {
  if (p.phase === "full") {
    p.phase = "home";
    p.since = 0;
    return;
  }
  if (p.phase !== "held") return;
  p.phase = "home";
  // A pull that never left the knob is a tap, and a tap is never refused.
  if (progress(shape, p) < 0.04) {
    p.off = { x: 0, y: 0 };
    return;
  }
  p.verdict = short === "refuse" ? "refused" : "ignored";
  if (short === "refuse") p.refused++;
  p.slow = short === "refuse";
  p.since = 0;
  p.age = 0;
  if (short === "refuse") p.last = "refused";
}

/** The clock: a knob let go springs home, and a verdict fades. */
export function tick(shape: LabShape, p: LabPull, dt: number): void {
  if (p.verdict) p.since += dt;
  p.age += dt;
  if (p.phase === "idle") p.rested += dt;
  if (p.verdict && p.since > VERDICT_SECONDS && p.phase !== "full") {
    p.verdict = null;
    // Rest is counted from when nothing is shown any more.
    p.rested = 0;
  }
  if (p.phase !== "home") return;
  // A counted pull rests at the end a moment before it goes home, and a
  // failed one where it was let go.
  if (p.verdict === "counted" && p.since < VERDICT_SECONDS * 0.5) return;
  if (p.slow && p.verdict && p.since < FAILED_REST) return;
  const back = Math.min(1, (p.slow ? SPRING_FAILED : SPRING) * dt);
  p.at += (shape.origin - p.at) * back;
  p.off = { x: p.off.x * (1 - back), y: p.off.y * (1 - back) };
  if (Math.abs(p.at - shape.origin) < 0.002 && Math.hypot(p.off.x, p.off.y) < 0.5) {
    p.at = shape.origin;
    p.off = { x: 0, y: 0 };
    p.slow = false;
    p.phase = "idle";
    p.rested = 0;
    p.sign = 0;
  }
}
