import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SnakeState,
  snakeRound,
  startWave,
  step,
  type TimedCommand,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { snakeMawOpen } from "../src/snake-arena.js";
import { SNAKE_MORPH_BEATS } from "../src/snake-round.js";

/**
 * **SNAKE's body as it grows, and the one press that opens its mouth.**
 *
 * From 18 September 2026 to 10 October 2026 the jaws stuck past a length and
 * the MAW press went dead, and player 1 prised them open on the neck instead.
 * The owner took that out: MAW answers however long the body has grown, and
 * nothing is held on the body. The tail player 2 could lift clear went on 6
 * October 2026.
 *
 * The bodies here are **set** rather than eaten to. That is the one thing this
 * file does that `snake.test.ts` does not: a body of eight tiles is four
 * points swallowed and three rounds of driving, and a test that got there by
 * playing would be a test about the driving.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const WAVE = 6;

/** An arena with nothing in the body's way: the grips are the subject here. */
const ROUNDS = [
  {
    enemies: [{ col: CFG.snakeCols - 1, row: 0 }],
    points: [
      { col: 1, row: 1 },
      { col: 0, row: 0 },
    ],
    rocks: [],
    beats: 40,
    stepTicks: 60,
  },
];

function open(): World {
  const world = createWorld(CFG, 3);
  startWave(world, WAVE, [], [], { kind: "snake", rounds: ROUNDS });
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 2) * TPB; i++) {
    if (snakeRound(world)?.phase === "play") break;
    step(world, []);
  }
  return world;
}

function round(world: World): SnakeState {
  const snake = snakeRound(world);
  if (snake === null) throw new Error("no round running");
  return snake;
}

/**
 * Stand the body up at `tiles` long, straight down the column it opened in.
 * Head first, so the tail is the far end.
 */
function lengthen(snake: SnakeState, tiles: number): void {
  const head = snake.body[0];
  if (!head) throw new Error("a body with no head");
  snake.body = Array.from({ length: tiles }, (_, i) => ({ col: head.col, row: head.row + i }));
}

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): void {
  step(world, [{ tick: world.tick, player, command }]);
}

/** A drag on the body, which nothing on it answers any more. */
const onBody: TimedCommand["command"] = {
  kind: "drag",
  target: "gripBody",
  on: false,
  fromMilli: 0,
  fromYMilli: 3000,
};

describe("the mouth, however long the body", () => {
  it("opens to the press at the length a round opens on", () => {
    const world = open();
    expect(round(world).body.length).toBe(CFG.snakeStartTiles);
    press(world, 1, { kind: "snakeMaw" });
    expect(snakeMawOpen(world, round(world))).toBe(true);
  });

  it("opens to the press on a body grown long", () => {
    const world = open();
    lengthen(round(world), CFG.snakeStartTiles + 20);
    press(world, 1, { kind: "snakeMaw" });
    expect(snakeMawOpen(world, round(world))).toBe(true);
  });

  it("is not opened by the driver, nor by a carry on the body", () => {
    const world = open();
    lengthen(round(world), CFG.snakeStartTiles + 20);
    press(world, 2, { kind: "snakeMaw" });
    expect(snakeMawOpen(world, round(world))).toBe(false);
    press(world, 1, onBody);
    expect(snakeMawOpen(world, round(world))).toBe(false);
  });

  /** The mouth is a window and not a hold: the rest is the whole of it. */
  it("cannot be opened again until the mouth has shut", () => {
    const world = open();
    press(world, 1, { kind: "snakeMaw" });
    const first = round(world).mawTick;
    step(world, []);
    press(world, 1, { kind: "snakeMaw" });
    expect(round(world).mawTick).toBe(first);
  });
});

describe("the tail, which nobody holds", () => {
  /**
   * The driver's thumb that lifted the tail clear went on 6 October 2026, and
   * with it the one way the head could cross the body. A body driven into its
   * own tail is a crash, and a crash is the wave lost (`snake-move.ts`),
   * however long the body has grown.
   */
  it("crashes a head driven into its own tail, however long the body", () => {
    const world = open();
    const snake = round(world);
    // A body curled so that the tile straight ahead of the head is the third
    // from its tail: head going up, the body down one column and back up the
    // next, and the tail brought round in front.
    const head = snake.body[0];
    if (!head) throw new Error("a body with no head");
    snake.dirCol = 0;
    snake.dirRow = -1;
    const { col, row } = head;
    snake.body = [{ col, row }];
    for (let r = row; r <= row + 4; r++) snake.body.push({ col: col + 1, row: r });
    for (let r = row + 4; r >= row - 2; r--) snake.body.push({ col: col + 2, row: r });
    snake.body.push({ col: col + 1, row: row - 2 });
    snake.body.push({ col, row: row - 2 });
    snake.body.push({ col, row: row - 1 });
    snake.body.push({ col: col - 1, row: row - 1 });
    snake.body.push({ col: col - 1, row });
    for (let i = 0; i < ROUNDS[0]!.stepTicks + 2; i++) step(world, []);
    expect(round(world).crashTick).toBeGreaterThanOrEqual(0);
  });
});
