import { expect, test } from "bun:test";
import { createWorld, startWave } from "../src/index.js";
import { MAZE_TURN, mazeWrap } from "../src/maze.js";
import { mazeOpenRound } from "../src/maze-verdict.js";
import { CFG, mazeOf, WHEELS } from "./maze-fixture.js";

/**
 * THE MAZE's drum comes up turned (`maze-spin.ts`): a different angle on
 * every try of the wave, the same on both devices, never with a way in at the
 * ship — and upright only when a rehearsal asks for it.
 */

/** Every way in's distance round from straight down, at the drum's angle. */
function nearest(angle: number, round = 0): number {
  return Math.min(
    ...WHEELS[round]!.entrances.map((e) => {
      const a = mazeWrap(angle + e.angleMilli);
      return Math.min(a, MAZE_TURN - a);
    }),
  );
}

test("a wave played again opens its drum at another angle, clear of the ship", () => {
  const world = createWorld(CFG, 7);
  const angles: number[] = [];
  for (let i = 0; i < 6; i++) {
    startWave(world, 0, [], [], { kind: "maze", rounds: WHEELS });
    const angle = mazeOf(world).angleMilli;
    expect(nearest(angle)).toBeGreaterThanOrEqual(MAZE_TURN / 8);
    angles.push(angle);
  }
  expect(new Set(angles).size).toBeGreaterThan(1);
});

test("two devices on one seed deal the same drum", () => {
  const a = createWorld(CFG, 3);
  const b = createWorld(CFG, 3);
  startWave(a, 0, [], [], { kind: "maze", rounds: WHEELS });
  startWave(b, 0, [], [], { kind: "maze", rounds: WHEELS });
  expect(mazeOf(a).angleMilli).toBe(mazeOf(b).angleMilli);
});

test("every later wheel is dealt too, and a rehearsal's hangs upright", () => {
  const world = createWorld(CFG, 11);
  startWave(world, 0, [], [], { kind: "maze", rounds: WHEELS, upright: true });
  expect(mazeOf(world).angleMilli).toBe(mazeWrap(WHEELS[0]!.startMilli));
  const m = mazeOf(world);
  mazeOpenRound(world, m, 2);
  expect(nearest(m.angleMilli, 2)).toBeGreaterThanOrEqual(MAZE_TURN / 8);
});
