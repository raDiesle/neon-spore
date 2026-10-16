import { midCol } from "./config.js";
import type { Color } from "./types.js";
import type { World } from "./world.js";

/**
 * THE GEODE: a stone as wide as the field, sinking on the ship, with a crystal
 * heart inside it — and the lance is the only thing that cuts stone. The
 * owner's ask of 16 October 2026: *a new boss wave after THE LANCE's, with
 * the lance as its main weapon … cool and logical to use, with special
 * graphics — the lance breaking something into bigger pieces.*
 *
 * **The rule is one sentence**: burn each crack with the lance, in its
 * colour, before the stone lands.
 *
 * **A bolt only chips stone.** It is met on the rock and does nothing, which
 * is the lance's whole argument made into a boss: the hold that keeps the
 * cannon still for three beats is the one shot here that counts.
 *
 * **Every beam breaks a piece in two**, so the stone's health is how many
 * pieces it is in: one boulder, two halves, four quarters, then the crystal
 * heart. Each level is a piece count and a different thing to ask of the
 * lance (the owner on THE GRINDSTONE, 8 October 2026: *levels that change
 * what is asked*):
 * 1. the boulder — one crack, off the middle: slide, hold, burn;
 * 2. the halves — two cracks, one of each colour: slide again, change colour;
 * 3. the quarters — two of them stacked in one column with one colour of
 *    crack: **one beam takes both**, THE LANCE's own lesson;
 * 4. the heart — two cracks in one column, one of each colour: the cannon
 *    stays still and the colour changes under it.
 *
 * **Crossed, the way the field always is**: the render shows the crack's line
 * only to the navigator and the crystal's colour only to the pilot, so each
 * has the other's word — where, and which colour (`render/` is the split; the
 * simulation sees both).
 *
 * **A beam of the wrong colour in a crack's column loses the wave** — the
 * owner's default of 10 October 2026 (`boss-wrong-colour.ts`) — but only where
 * no crack of its own colour stands in that column: a beam takes what it can.
 * **A level whose time runs out is the stone landing**: the piece still whole
 * strikes the hull (`bossStrikesHull`).
 */

/** Where the scene is: sinking in, a level's cracks lit, breaking apart between levels, landed, shattered. */
export const GEODE_PHASES = ["enter", "crack", "split", "struck", "spent"] as const;
export type GeodePhase = (typeof GEODE_PHASES)[number];

/** Columns either side of the middle the stone covers: the whole field, so every bolt is met on rock. */
export const GEODE_SPAN = 5;

/** One crack of a level: the column it runs down, from the middle, and the crystal's colour under it. */
export interface GeodeCrack {
  at: number;
  color: Color;
}

/** One level of the script, authored on the wave: a piece per crack. */
export interface GeodeStep {
  /** Beats the level may take before the stone lands. */
  beats: number;
  /** The level's cracks, one per piece; two at the same `at` are pieces stacked in one column. */
  cracks: GeodeCrack[];
}

/** What a wave authors: the whole script, in order. */
export interface GeodeEntry {
  kind: "geode";
  steps: readonly GeodeStep[];
}

export interface GeodeState {
  kind: "geode";
  /** Copied at install and never written again. */
  steps: GeodeStep[];
  phase: GeodePhase;
  /** `world.beat` the phase began. */
  phaseBeat: number;
  /** The level lit, or the next to light. */
  cursor: number;
  /** `world.tick` each piece of the lit level was cut on, or -1 while it is whole. */
  cutTick: number[];
  /** Pieces cut in every level so far. */
  pieces: number;
}

export function geodeBoss(world: World): GeodeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "geode" ? boss : null;
}

/** The level lit, or null between levels. */
export function geodeLitStep(s: GeodeState): GeodeStep | null {
  return s.phase === "crack" ? (s.steps[s.cursor] ?? null) : null;
}

/** Whether piece `i` of the lit level is cut. */
export function geodeCut(s: GeodeState, i: number): boolean {
  return (s.cutTick[i] ?? -1) >= 0;
}

/** The lit level's pieces still whole. */
export function geodeLeft(s: GeodeState): number {
  const step = s.steps[s.cursor];
  if (step === undefined) return 0;
  let left = 0;
  for (let i = 0; i < step.cracks.length; i++) if (!geodeCut(s, i)) left += 1;
  return left;
}

/** The column crack `i` of level `level` runs down. */
export function geodeCrackCol(world: World, s: GeodeState, level: number, i: number): number {
  return midCol(world.cfg) + (s.steps[level]?.cracks[i]?.at ?? 0);
}

/** The lit level's whole pieces whose crack runs down `col`, in the level's order. */
export function geodeCracksIn(world: World, s: GeodeState, col: number): number[] {
  const step = geodeLitStep(s);
  if (step === null) return [];
  const out: number[] = [];
  for (let i = 0; i < step.cracks.length; i++) {
    if (!geodeCut(s, i) && geodeCrackCol(world, s, s.cursor, i) === col) out.push(i);
  }
  return out;
}

/** The first whole piece of the lit level, or -1: what lands if the time runs out, and what AUTO burns next. */
export function geodeNext(s: GeodeState): number {
  const step = geodeLitStep(s);
  if (step === null) return -1;
  for (let i = 0; i < step.cracks.length; i++) if (!geodeCut(s, i)) return i;
  return -1;
}

/** Cracks in the whole script: the geode's health. */
export function geodePiecesAll(s: GeodeState): number {
  return s.steps.reduce((sum, step) => sum + step.cracks.length, 0);
}

/** The geode is shattered: the fight is over. */
export function geodeDone(s: GeodeState): boolean {
  return s.phase === "spent";
}

/** A fresh geode: every crack to come, nothing cut. */
export function freshGeode(beat: number, steps: readonly GeodeStep[]): GeodeState {
  return {
    kind: "geode",
    steps: steps.map((step) => ({
      beats: step.beats,
      cracks: step.cracks.map((c) => ({ at: c.at, color: c.color })),
    })),
    phase: "enter",
    phaseBeat: beat,
    cursor: 0,
    cutTick: [],
    pieces: 0,
  };
}
