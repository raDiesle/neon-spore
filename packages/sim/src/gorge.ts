import type { World } from "./world.js";

/**
 * THE GORGE: what not to do.
 *
 * **The question no other boss asks** — *which bubble, how many, and in what
 * colour.* A row of **bubbles** hangs in the middle of the field, and each
 * one wants a count of shots in a colour before it is **sated**. The count
 * and the order are on player 1's screen; the colour each wants is on
 * player 2's. Neither can fill one alone, so every shot is a sentence
 * (`docs/spec/bosses-choreographed.md` §3).
 *
 * A shot meets a bubble mid-field, in its column, as it would a body
 * (`gorgeAlong`). The colour it wants fills it a step; the other colour takes
 * a step back out. A shot it **refuses** — a bubble out of turn, or a shut
 * one — comes back down the column as a body of the shot's colour, so the
 * cost of a wrong call is a thing to shoot again.
 *
 * The fight is **levels**, authored in content (`GORGE_LEVELS`) and rolled at
 * install — the shape is written, the counts are not:
 *
 * - **a row, in any order** — every bubble one colour, the counts random.
 * - **a row, in order** — player 1 sees which goes first; a shot into any
 *   other is refused.
 * - **a ring** — the bubbles turn round a circle every `gorgeTurnBeats`, and
 *   only the one at the bottom can be shot, and only once player 1 has
 *   tapped it open `gorgeOpenTaps` times. The ring keeps turning while the
 *   pair works: what a bubble holds stays with it, the taps do not.
 * - **mixed** — a bubble wants both colours at once, a count of each.
 *
 * Between levels it stands `gorgeLevelGapBeats` sated; after the last it is
 * **out**, and the boss stays `gorgeOutBeats` more so the wave cannot end on
 * the same beat. The phase is read off the state rather than kept
 * (`gorgePhase`).
 *
 * **It is a fixture and not a body** (`bossFillsWave`): nothing of it falls
 * but what it refuses, and the arrivals around it are the wave's own.
 *
 * The clock is `gorge-step.ts`, the fingerprint `gorge-hash.ts`, the numbers
 * `config-gorge.ts`. This file is the shape and the questions asked of it.
 */

/**
 * The movements, in the order render and the tests name them by. Derived,
 * not stored, so there is nothing here for `gorge-hash.ts` to number.
 */
export const GORGE_PHASES = ["row", "ring", "clear", "out"] as const;

export type GorgePhase = (typeof GORGE_PHASES)[number];

/** One level's shape, as content authors it. The counts are rolled from it at install. */
export interface GorgeLevel {
  /** How many bubbles hang. */
  intakes: number;
  /** Whether they must be sated in the order player 1 is shown. */
  ordered: boolean;
  /** Whether they turn round a circle, opened by player 1's taps, rather than hang in a row. */
  ring: boolean;
  /** How many of the bubbles want both colours at once. */
  mixed: number;
  /** The fewest shots a bubble wants, all colours together. */
  needMin: number;
  /** The most. */
  needMax: number;
}

/** One bubble: what it wants and what it has. */
export interface GorgeIntake {
  /** Red shots it wants. */
  needRed: number;
  /** Cyan shots it wants. */
  needCyan: number;
  /** Red shots it has, `0` to `needRed`. */
  gotRed: number;
  /** Cyan shots it has, `0` to `needCyan`. */
  gotCyan: number;
  /** Its place in the order, `0` first; `-1` on a level where order does not matter. */
  order: number;
  /** Player 1's taps on it while it is at the bottom of the ring; reset when it turns away. */
  taps: number;
}

/** Everything THE GORGE remembers between beats. */
export interface GorgeState {
  kind: "gorge";
  /** The leftmost column of the row; bubble `i` of a row level hangs over `col + i`. */
  col: number;
  /** The levels, as authored. */
  levels: readonly GorgeLevel[];
  /** The level being fought, an index into `levels`. */
  level: number;
  /** This level's bubbles. */
  intakes: GorgeIntake[];
  /** The order place that is due next; unused on a level where order does not matter. */
  next: number;
  /** On a ring, how many steps it has turned: bubble `turn % intakes.length` is at the bottom. */
  turn: number;
  /** `world.beat` of the last turn, or of the level's start; the next turn counts from it. */
  turnBeat: number;
  /** `world.beat` the level was sated on; `-1` while it is still being fed. */
  clearBeat: number;
  /** `world.beat` the last level was sated on; `-1` until then. */
  outBeat: number;
}

/** THE GORGE when it is the boss, or `null`. */
export function gorgeBoss(world: World): GorgeState | null {
  const boss = world.boss;
  return boss !== null && boss.kind === "gorge" ? boss : null;
}

/** The level being fought. */
export function gorgeLevelOf(g: GorgeState): GorgeLevel {
  return g.levels[g.level] ?? g.levels[g.levels.length - 1] ?? NO_LEVEL;
}

const NO_LEVEL: GorgeLevel = {
  intakes: 0,
  ordered: false,
  ring: false,
  mixed: 0,
  needMin: 0,
  needMax: 0,
};

export function gorgePhase(g: GorgeState): GorgePhase {
  if (g.outBeat >= 0) return "out";
  if (g.clearBeat >= 0) return "clear";
  return gorgeLevelOf(g).ring ? "ring" : "row";
}

/** Whether a bubble has everything it wants. */
export function gorgeSated(k: GorgeIntake): boolean {
  return k.gotRed >= k.needRed && k.gotCyan >= k.needCyan;
}

/** Shots a bubble still wants, both colours together. */
export function gorgeOwed(k: GorgeIntake): number {
  return Math.max(0, k.needRed - k.gotRed) + Math.max(0, k.needCyan - k.gotCyan);
}

/** On a ring, the bubble at the bottom — the only one a shot or a tap reaches. */
export function gorgeBottom(g: GorgeState): number {
  const n = g.intakes.length;
  return n === 0 ? -1 : g.turn % n;
}

/** Whether bubble `i` is the one due, or order does not matter on this level. */
export function gorgeDue(g: GorgeState, i: number): boolean {
  const k = g.intakes[i];
  return k !== undefined && (k.order < 0 || k.order === g.next);
}

/** Every shot the bubbles hold, sated or not: what leaves when it goes. */
export function gorgeBeads(g: GorgeState): number {
  let n = 0;
  for (const k of g.intakes) n += k.gotRed + k.gotCyan;
  return n;
}
