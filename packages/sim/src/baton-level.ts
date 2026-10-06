import type { BatonState } from "./baton.js";

/**
 * THE BATON's levels: the passes of the arm inside its one wave, each adding
 * one thing to the last.
 *
 * The owner, 6 October 2026: *make the wave harder in levels; each level
 * builds up slowly and brings in only one new thing.* So the arm is not
 * beaten once. It unfolds, the pair passes the bead down it and into the
 * maw, it folds away — and it comes back as the next level, until the last.
 *
 * - `single` — one bead, all the way down. The arm swings and sheds as it
 *   always has once enough of it is dark, but nothing lights beside the bead,
 *   and a struck flight out of the last socket is the drop.
 * - `twin` — the fight as it shipped before the levels: the second bead
 *   lights, the two are drawn together in the last sockets, and the merged
 *   bead's crossing is the drop.
 * - `pair` — two beads again, but the second has **an arm of its own**,
 *   hanging a column either side of the centre (`baton-arm.ts`): both are
 *   lit from the start, the one trigger sends whichever sat longest, and the
 *   cannon crosses between the arms for every shot. The two beads are drawn
 *   together across the gap once each sits in its arm's last socket — the
 *   pilot's thumb on the left, the navigator's on the right — and the
 *   crossing is the drop, as on `twin`.
 * - `across` — the last: `twin` again on one arm, but **the arm lies along a
 *   row** (`batonAcrossRow`), a socket a column from the left, and every
 *   flight is a column to the right — so the cannon meets the bead column by
 *   column, which on the hanging arm only the swing asked of it.
 *
 * A list rather than a bare union for `BATON_STAGES`' reason: a level goes
 * into `hashWorld` as its index.
 */
export const BATON_LEVELS = ["single", "twin", "pair", "across"] as const;

/** One pass of the arm. */
export type BatonLevel = (typeof BATON_LEVELS)[number];

/** The level the arm is on. */
export function batonLevel(b: BatonState): BatonLevel {
  return BATON_LEVELS[b.level] ?? "single";
}

/** Whether this pass lights a second bead (`batonTwin`). */
export function batonTwins(b: BatonState): boolean {
  return batonLevel(b) === "twin" || batonLevel(b) === "across";
}

/** Whether the arm lies along a row rather than hanging down a column. */
export function batonAcross(b: BatonState): boolean {
  return batonLevel(b) === "across";
}

/** How many arms hang on a level: two on `pair`, one on the rest. */
export function batonArmsAt(level: number): number {
  return BATON_LEVELS[level] === "pair" ? 2 : 1;
}

/** How many arms this pass hangs. */
export function batonArms(b: BatonState): number {
  return batonArmsAt(b.level);
}

/** Whether a level follows this one, so the fold is a pause and not the end. */
export function batonHasNextLevel(b: BatonState): boolean {
  return b.level + 1 < BATON_LEVELS.length;
}
