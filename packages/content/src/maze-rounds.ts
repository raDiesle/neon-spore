import { type MazeDir, type MazeTangle, mazeNode } from "@neon-spore/sim";

/**
 * THE MAZE's three tangles, one per round.
 *
 * **Authored, never generated.** Two devices have to be looking at the same
 * labyrinth, and the cheapest way to guarantee that is for there to be only
 * one — the argument `mirror.ts` makes about its sequences, made again. There
 * is no rng in this file and nothing in the boss draws from one.
 *
 * **How to read a row.** Each node is a fork: `n([a, b], shut)` says the two
 * ways out it offers and which of them is fused. The pilot's screen shows the
 * arms and never the fused one; the navigator's shows the fused one and never
 * the arms. The way through is the arm that is not fused, so every node of
 * every path needs one sentence from each seat — which is the entire boss and
 * the thing `test/maze.test.ts` proves rather than assumes.
 *
 * **The three rounds get harder by taking information away.** In the first,
 * each seat alone can already rule one mouth out, so the pair meets in the
 * middle and only has to settle between two. In the second the pilot can rule
 * nothing out. In the third neither of them can: on his own screen and on
 * hers, all three mouths still reach the core, and the answer exists nowhere
 * except in the sentence between them.
 */

const n = (arms: readonly MazeDir[], shut: MazeDir) => mazeNode(arms, shut);

/** One mouth reaches the core, and each seat alone is down to two. */
const NARROW: MazeTangle = {
  core: 1,
  nodes: [
    [n([0, 1], 0), n([0, 1], 1), n([-1, 1], -1), n([0, 1], 1), n([-1, 0], 0)],
    [n([0, 1], 1), n([-1, 1], 1), n([-1, 1], -1), n([-1, 1], -1), n([-1, 0], 0)],
    [n([0, 1], 0), n([-1, 1], -1), n([0, 1], 1), n([0, 1], 1), n([-1, 0], 0)],
  ],
};

/** The pilot can rule nothing out; the navigator is still down to two. */
const HALF_BLIND: MazeTangle = {
  core: 3,
  nodes: [
    [n([0, 1], 1), n([0, 1], 1), n([-1, 1], 1), n([-1, 0], -1), n([-1, 0], -1)],
    [n([0, 1], 1), n([0, 1], 1), n([-1, 1], -1), n([0, 1], 1), n([-1, 0], 0)],
    [n([0, 1], 1), n([0, 1], 1), n([-1, 1], -1), n([0, 1], 1), n([-1, 0], -1)],
  ],
};

/** Neither of them can rule anything out. Both screens say all three. */
const BLIND: MazeTangle = {
  core: 2,
  nodes: [
    [n([0, 1], 0), n([-1, 0], 0), n([0, 1], 1), n([0, 1], 0), n([-1, 0], 0)],
    [n([0, 1], 1), n([-1, 1], 1), n([-1, 1], -1), n([-1, 1], -1), n([-1, 0], 0)],
    [n([0, 1], 0), n([-1, 1], -1), n([-1, 0], -1), n([-1, 0], 0), n([-1, 0], -1)],
  ],
};

/**
 * The fight, in order. Three rounds, so each answered one takes a third of the
 * boss's hull and the last is the one that brings it down — the author sets
 * the length of the fight by writing rounds, never by tuning a number.
 */
export const MAZE_ROUNDS: MazeTangle[] = [NARROW, HALF_BLIND, BLIND];
