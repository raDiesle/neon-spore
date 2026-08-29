import { type MazeMove, type MazeWheel, mazeRoute } from "@neon-spore/sim";

/**
 * THE MAZE's wheels, one per round. The pilot pulls the string, a way in
 * clicks onto a column, the cannon slides under it and player 2 fires; the
 * shot walks the corridor and finds the middle or a dead end.
 *
 * **Authored, never generated.** Two devices have to be looking at the same
 * drum, and the cheapest way to guarantee that is for there to be only one —
 * the argument `mirror.ts` makes about its sequences. There is no rng in this
 * file and nothing in the boss draws from one, the opening angle included.
 *
 * **How to read a wheel.** `sectors` is how many slices the rim is cut into,
 * `rings` how many corridors lie between the rim and the middle, ring 0 being
 * the middle itself. A way in names its sector and then the moves the shot
 * makes from it: `in` one ring toward the middle, `cw` and `ccw` one sector
 * round. `mazeRoute` turns those into the cells the shot stands on, so the
 * picture and the shot read the same list; `mazeFault` refuses anything that
 * steps through a wall, and `test/maze.test.ts` runs it over all three.
 *
 * **Neither player knows which one goes anywhere.** The drum is drawn closed —
 * rings and mouths, no corridors — so the shot is what finds out, and it costs
 * the hull to be wrong. That is the whole conversation this round has, and it
 * is why the wrong route is worth *drawing* once it has failed.
 *
 * **The three wheels get harder by widening the search.** Two ways in, then
 * three, then four, with the corridors growing longer under them: a wrong
 * guess on the first costs one probe, and on the last it can cost three.
 */

const wheel = (
  rings: number,
  sectors: number,
  startMilli: number,
  ways: readonly (readonly [number, readonly MazeMove[]])[],
): MazeWheel => {
  const shape = { rings, sectors };
  return {
    rings,
    sectors,
    startMilli,
    entrances: ways.map(([sector, moves]) => ({ sector, route: mazeRoute(shape, sector, moves) })),
  };
};

/**
 * Two ways in and three rings. The owner asked for the simple case first and
 * it is the right one: the smallest drum that still needs both verbs, both
 * screens and a probe. The mouths are five sectors apart rather than opposite,
 * so a pilot who has clicked one onto a column is not automatically one pull
 * from the other.
 */
const PAIR: MazeWheel = wheel(3, 12, 15_000, [
  [0, ["cw", "in", "cw", "in"]],
  [5, ["ccw", "in", "ccw", "ccw"]],
]);

/** Three ways in, four rings, and one of the dead ends runs almost all the
 * way to the middle before it stops — so a shot that nearly arrives is not the
 * same thing as one that did. */
const THREE: MazeWheel = wheel(4, 12, 200_000, [
  [1, ["cw", "in", "in", "cw", "in"]],
  [5, ["ccw", "in", "in", "ccw", "ccw"]],
  [9, ["in", "cw", "cw", "in", "cw"]],
]);

/** Four ways in and four rings: the wheel where a pair who will not talk can
 * spend three quarters of the hull finding the one that goes anywhere. */
const FOUR: MazeWheel = wheel(4, 16, 330_000, [
  [0, ["cw", "in", "cw", "in", "in"]],
  [4, ["in", "ccw", "ccw", "in", "ccw"]],
  [8, ["ccw", "in", "in", "ccw", "ccw"]],
  [12, ["cw", "cw", "in", "cw", "in"]],
]);

/**
 * The fight, in order. Three wheels, so each one finished takes a third of the
 * boss's hull and the last is the one that brings it down — the author sets
 * the length of the fight by writing wheels, never by tuning a number.
 */
export const MAZE_ROUNDS: MazeWheel[] = [PAIR, THREE, FOUR];
