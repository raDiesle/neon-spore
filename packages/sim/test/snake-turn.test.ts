import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SnakeState,
  snakeCrashed,
  snakeRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { SNAKE_MORPH_BEATS } from "../src/snake-round.js";

/**
 * SNAKE's wheel answers **on the tick it is pressed** (`turnSnake`): on the
 * tile the head stands on in the first half of a step, one tile on in the
 * second. It used to wait for the next step, and the owner found it laggy
 * (29 September 2026).
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const MID = Math.floor(CFG.snakeCols / 2);
const HEAD = CFG.snakeRows - CFG.snakeStartTiles;
const STEP = 60;

/** Nothing in the middle of the arena: one enemy and one point in far corners keep the round open. */
const ROUNDS = [
  {
    enemies: [{ col: CFG.snakeCols - 1, row: 0 }],
    points: [{ col: 0, row: 0 }],
    rocks: [],
    beats: 40,
    stepTicks: STEP,
  },
];

function open(): World {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "snake", rounds: ROUNDS });
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 2) * TPB; i++) {
    if (round(world).phase === "play") return world;
    step(world, []);
  }
  throw new Error("the round never started moving");
}

function round(world: World): SnakeState {
  const snake = snakeRound(world);
  if (snake === null) throw new Error("no round running");
  return snake;
}

function wait(world: World, ticks: number): void {
  for (let i = 0; i < ticks; i++) step(world, []);
}

function turn(world: World, dir: "left" | "right"): void {
  const c: TimedCommand = { tick: world.tick, player: 2, command: { kind: "snakeTurn", dir } };
  step(world, [c]);
}

describe("a turn is taken the tick it is pressed", () => {
  it("turns on the tile the head stands on in the first half of a step", () => {
    const world = open();
    const snake = round(world);
    wait(world, STEP / 4);
    turn(world, "left");
    expect([snake.dirCol, snake.dirRow]).toEqual([-1, 0]);
    expect(snake.body[0]).toEqual({ col: MID, row: HEAD });
    // The step keeps its time, and goes the new way.
    wait(world, STEP - STEP / 4 - 2);
    expect(snake.body[0]).toEqual({ col: MID, row: HEAD });
    wait(world, 1);
    expect(snake.body[0]).toEqual({ col: MID - 1, row: HEAD });
  });

  it("takes the step now and turns one tile on in the second half", () => {
    const world = open();
    const snake = round(world);
    wait(world, (STEP * 3) / 4);
    turn(world, "right");
    expect(snake.body[0]).toEqual({ col: MID, row: HEAD - 1 });
    expect([snake.dirCol, snake.dirRow]).toEqual([1, 0]);
    // A whole step from the one just taken, not from the one it replaced.
    wait(world, STEP - 1);
    expect(snake.body[0]).toEqual({ col: MID, row: HEAD - 1 });
    wait(world, 1);
    expect(snake.body[0]).toEqual({ col: MID + 1, row: HEAD - 1 });
  });

  it("keeps the last press of a tile, and never adds two up to a reversal", () => {
    const world = open();
    const snake = round(world);
    turn(world, "left");
    turn(world, "left");
    expect([snake.dirCol, snake.dirRow]).toEqual([-1, 0]);
    turn(world, "right");
    expect([snake.dirCol, snake.dirRow]).toEqual([1, 0]);
    expect(snake.turn).toBe(1);
  });

  it("crashes on the tick it is pressed when the step it takes is into something", () => {
    const world = open();
    const snake = round(world);
    // Up against the wall on the right, heading up, half a step gone.
    snake.body = snake.body.map((t) => ({ col: CFG.snakeCols - 1, row: t.row }));
    turn(world, "right");
    wait(world, STEP / 2);
    turn(world, "right");
    expect(snakeCrashed(snake)).toBe(true);
    expect(snake.phase).toBe("verdict");
    expect(snake.passed).toBe(false);
  });
});
