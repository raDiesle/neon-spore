import { expect, test } from "bun:test";
import { mazeCoreEntrance, mazeFault } from "@neon-spore/sim";
import { MAZE_ROUNDS } from "../src/maze-rounds.js";

/**
 * THE MAZE's authored drums, checked where they are written.
 *
 * These used to live in `packages/sim/test/maze.test.ts`, which had to reach
 * across into `content` to read them — the dependency `sim` is not allowed to
 * have, arriving through the test graph instead of an import. Here it is the
 * permitted direction: `content` names `sim`'s rules and is judged by them.
 *
 * What is under test is the data, so nothing is copied: a local fixture would
 * prove nothing the moment the two drifted apart. `sim` keeps its own wheels
 * for the geometry, and they are allowed to be any legal wheels at all.
 */

test("every authored wheel is a wheel, with exactly one way to the middle", () => {
  expect(MAZE_ROUNDS.length).toBeGreaterThan(0);
  for (const [i, wheel] of MAZE_ROUNDS.entries()) {
    expect(mazeFault(wheel), `round ${i}`).toBeNull();
    expect(mazeCoreEntrance(wheel), `round ${i}`).toBeGreaterThanOrEqual(0);
    expect(wheel.entrances.length, `round ${i}`).toBeGreaterThanOrEqual(2);
  }
});

test("the wheels get harder by widening the search", () => {
  const ways = MAZE_ROUNDS.map((w) => w.entrances.length);
  for (let i = 1; i < ways.length; i++) expect(ways[i]!).toBeGreaterThan(ways[i - 1]!);
});
