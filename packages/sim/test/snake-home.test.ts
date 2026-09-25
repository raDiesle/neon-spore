import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SnakeState,
  snakeCrashed,
  snakeGate,
  snakeRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { SNAKE_MORPH_BEATS } from "../src/snake-round.js";

/**
 * **Going home** (`snake-home.ts`): a cleared arena is not a round won until
 * the body is back inside the ship, through the mouth in the middle of the
 * floor. The owner, 25 September 2026.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const MID = Math.floor(CFG.snakeCols / 2);
const FLOOR = CFG.snakeRows - 1;

const ROUNDS = [
  {
    enemies: [{ col: 0, row: 0 }],
    points: [{ col: 2, row: 0 }],
    rocks: [],
    beats: 20,
    stepTicks: 40,
  },
  {
    enemies: [{ col: 4, row: 0 }],
    points: [{ col: 6, row: 0 }],
    rocks: [],
    beats: 20,
    stepTicks: 30,
  },
];

function open(): World {
  const world = createWorld(CFG, 5);
  startWave(world, 6, [], [], { kind: "snake", rounds: ROUNDS });
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 2) * TPB && round(world).phase !== "play"; i++) {
    step(world, []);
  }
  return world;
}

function round(world: World): SnakeState {
  const snake = snakeRound(world);
  if (snake === null) throw new Error("no round running");
  return snake;
}

/** Everything spent, and the body a straight line down `col` with its head on the floor. */
function clearedAbove(world: World, col: number, heading: [number, number] = [0, 1]): SnakeState {
  const snake = round(world);
  snake.struck = [0];
  snake.taken = [0];
  snake.body = [0, 1, 2, 3].map((i) => ({ col, row: FLOOR - i }));
  [snake.dirCol, snake.dirRow] = heading;
  snake.stepTick = world.tick;
  return snake;
}

function run(world: World, ticks: number, until: (s: SnakeState) => boolean): void {
  for (let i = 0; i < ticks && !until(round(world)); i++) step(world, []);
}

describe("a cleared arena", () => {
  it("stops the clock: running out after the clear costs nothing", () => {
    const world = open();
    const snake = round(world);
    snake.struck = [0];
    snake.taken = [0];
    step(world, []);
    snake.roundBeat = world.beat - ROUNDS[0]!.beats - 4;
    step(world, []);
    expect(snake.phase).toBe("play");
    expect(world.scars.length).toBe(0);
  });

  it("opens one tile of the floor, under the middle column", () => {
    const world = open();
    const snake = clearedAbove(world, MID);
    run(world, ROUNDS[0]!.stepTicks + 1, (s) => s.body[0]!.row > FLOOR);
    expect(snakeCrashed(snake)).toBe(false);
    expect(snake.body[0]).toEqual(snakeGate(CFG));
  });

  it("is still a wall everywhere else", () => {
    const world = open();
    const snake = clearedAbove(world, MID - 1);
    run(world, ROUNDS[0]!.stepTicks + 1, snakeCrashed);
    expect(snakeCrashed(snake)).toBe(true);
  });

  it("keeps the mouth shut while anything still stands", () => {
    const world = open();
    const snake = clearedAbove(world, MID);
    snake.struck = [];
    run(world, ROUNDS[0]!.stepTicks + 1, snakeCrashed);
    expect(snakeCrashed(snake)).toBe(true);
  });
});

describe("inside the ship", () => {
  it("goes straight down on the quicker step, whatever the thumbs do", () => {
    const world = open();
    const snake = clearedAbove(world, MID);
    run(world, ROUNDS[0]!.stepTicks + 1, (s) => s.body[0]!.row > FLOOR);
    const at = world.tick;
    const turn: TimedCommand = {
      tick: world.tick,
      player: 2,
      command: { kind: "snakeTurn", dir: "left" },
    };
    step(world, [turn]);
    run(world, CFG.snakeHomeStepTicks * 2, (s) => s.body[0]!.row > FLOOR + 1);
    expect(snake.body[0]).toEqual({ col: MID, row: FLOOR + 2 });
    expect(world.tick - at).toBe(CFG.snakeHomeStepTicks);
  });

  it("opens the next round once the whole body is in, coming out of the ship again", () => {
    const world = open();
    clearedAbove(world, MID);
    run(world, 30 * TPB, (s) => s.round === 1);
    const snake = round(world);
    expect(snake.round).toBe(1);
    expect(snake.phase).toBe("morph");
    expect(snake.clearBeat).toBe(-1);
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
    expect(snake.body.every((t) => t.row < CFG.snakeRows)).toBe(true);
    run(world, (SNAKE_MORPH_BEATS + 1) * TPB, (s) => s.phase === "play");
    expect(snake.phase).toBe("play");
    expect(snake.roundBeat).toBe(world.beat);
  });

  it("passes the last round only once the body is home", () => {
    const world = open();
    const snake = round(world);
    snake.round = ROUNDS.length - 1;
    clearedAbove(world, MID);
    step(world, []);
    expect(snake.phase).toBe("play");
    run(world, 30 * TPB, (s) => s.phase !== "play");
    expect(snake.phase).toBe("verdict");
    expect(snake.passed).toBe(true);
    expect(snake.body.every((t) => t.row >= CFG.snakeRows)).toBe(true);
  });
});
