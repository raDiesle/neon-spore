import { nextInt } from "./rng.js";
import type { SpliceState } from "./splice.js";
import type { World } from "./world.js";

/**
 * Laying THE SPLICE's straws: three integer arrays and a permutation.
 *
 * The tangle is the fight, so it is the one thing here that is drawn from the
 * seeded `Rng` — and it is drawn **once per round**, at the moment the round
 * opens, never per frame and never per feed. Both devices step the same rng in
 * the same order and get the same straws, which is why nothing about the
 * picture crosses the wire.
 *
 * What is laid: the entrances are spread evenly across the bottom, the
 * numbered top ends evenly across the top, each straw is dragged through one
 * column of its own halfway up, and a permutation says which top end each
 * entrance reaches. Only the last two are random; the two rows are arithmetic,
 * so a narrower field simply spaces them closer and an author never places one
 * (`queue-boss.ts` has nothing to remap).
 *
 * Its own file rather than the bottom of `splice-round.ts`: that file is the
 * clock and the consequence, and this is the board they are played on — the
 * seam `fleet-board.ts` and `pinball-board.ts` already cut.
 */

/**
 * The column the `i`th of `n` evenly spread ends stands in.
 *
 * Spread with a margin at both walls rather than from wall to wall: an
 * entrance in column 0 is an entrance the cannon can only reach from one side,
 * and a pair calling *the leftmost* would be naming the wall rather than a
 * straw. Called for both rows, so the two can never be spaced by two rules
 * that disagree.
 */
export function spliceSpreadCol(i: number, n: number, cols: number): number {
  return Math.round(((i + 1) * (cols + 1)) / (n + 1)) - 1;
}

/**
 * A permutation of `n`, shuffled out of the world's rng.
 *
 * **Never the identity**, for `n` above one: the straws would be `n` straight
 * lines side by side, every number over its own entrance, and the navigator
 * would have nothing to trace and nothing to say. One swap fixes it and the
 * swap is deterministic, so two devices that drew the identity both fix it the
 * same way — a re-draw would have stepped the rng a different number of times
 * on a device that had already drawn something else from it.
 */
export function spliceShuffle(world: World, n: number): number[] {
  const order = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = nextInt(world.rng, i + 1);
    const a = order[i] as number;
    order[i] = order[j] as number;
    order[j] = a;
  }
  if (n > 1 && order.every((top, at) => top === at)) {
    order[0] = 1;
    order[1] = 0;
  }
  return order;
}

/**
 * Lay a round's straws onto a state that is already standing.
 *
 * It writes rather than returns, because opening a round is also clearing what
 * the last attempt fed and restarting its clock — and a caller holding a fresh
 * set of arrays beside a state it still had to reset is the arrangement where
 * one of the two gets forgotten.
 */
export function spliceLay(world: World, s: SpliceState, straws: number): void {
  const cols = world.cfg.cols;
  s.entranceCols = Array.from({ length: straws }, (_, i) => spliceSpreadCol(i, straws, cols));
  s.topCols = Array.from({ length: straws }, (_, i) => spliceSpreadCol(i, straws, cols));
  // One column per straw, drawn wall to wall on purpose: a waypoint kept off
  // the walls would leave a lane down each edge that no straw ever crosses,
  // and the edges are exactly where a tangle has to reach for the picture to
  // read as knotted rather than as a bundle down the middle.
  s.midCols = Array.from({ length: straws }, () => nextInt(world.rng, cols));
  s.topOf = spliceShuffle(world, straws);
  s.fed = 0;
  s.flights = [];
  s.passBeat = -1;
  s.eatBeat = -1;
  s.roundBeat = world.beat;
}
