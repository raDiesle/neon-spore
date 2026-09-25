import { describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  hashWorld,
  type SimConfig,
  type SnakeState,
  snakeGrip,
  snakeLifted,
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
 * **What SNAKE's body becomes as it grows**, and the two gestures that come
 * with it (`docs/spec/interludes.md`, SNAKE's *Three bodies, three gestures*).
 *
 * The body's length was already the difficulty and the health bar at once —
 * a tile per point, and the body is the obstacle. Since 18 September 2026 it
 * is the state as well: past `snakeGorgeTiles` the jaws stick and the MAW
 * press stops working, past `snakeShedTiles` the tail drags and player 2 may
 * lift it clear. Both new hands are on the body itself rather than on the
 * panel, and each is refused to the seat it does not belong to — the rule the
 * round's four verbs are already held to (`snake-controls.ts`).
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
 * Head first, so the tail is the far end and `snakeLifted` counts from there.
 */
function lengthen(snake: SnakeState, tiles: number): void {
  const head = snake.body[0];
  if (!head) throw new Error("a body with no head");
  snake.body = Array.from({ length: tiles }, (_, i) => ({ col: head.col, row: head.row + i }));
}

function press(world: World, player: 1 | 2, command: TimedCommand["command"]): void {
  step(world, [{ tick: world.tick, player, command }]);
}

const jaws = (milli: number): TimedCommand["command"] => ({
  kind: "drag",
  target: "snakeJaws",
  on: false,
  fromMilli: 0,
  fromYMilli: milli,
});

const tail = (on: boolean): TimedCommand["command"] => ({
  kind: "drag",
  target: "snakeTail",
  on,
  fromMilli: 0,
  fromYMilli: 0,
});

describe("what the body has become", () => {
  it("is crawl at the length a round opens on", () => {
    const world = open();
    expect(round(world).body.length).toBe(CFG.snakeStartTiles);
    expect(snakeGrip(CFG, round(world))).toBe("crawl");
  });

  it("is gorge past snakeGorgeTiles and shed past snakeShedTiles", () => {
    const world = open();
    const snake = round(world);
    lengthen(snake, CFG.snakeGorgeTiles);
    expect(snakeGrip(CFG, snake)).toBe("crawl");
    lengthen(snake, CFG.snakeGorgeTiles + 1);
    expect(snakeGrip(CFG, snake)).toBe("gorge");
    lengthen(snake, CFG.snakeShedTiles);
    expect(snakeGrip(CFG, snake)).toBe("gorge");
    lengthen(snake, CFG.snakeShedTiles + 1);
    expect(snakeGrip(CFG, snake)).toBe("shed");
  });
});

describe("the jaws, under gorge", () => {
  it("leaves the press working while the body is short", () => {
    const world = open();
    press(world, 1, { kind: "snakeMaw" });
    expect(snakeMawOpen(world, round(world))).toBe(true);
  });

  it("stops answering the press once the body is past gorge", () => {
    const world = open();
    lengthen(round(world), CFG.snakeGorgeTiles + 1);
    press(world, 1, { kind: "snakeMaw" });
    expect(snakeMawOpen(world, round(world))).toBe(false);
  });

  it("opens the same window to a carry that travelled far enough", () => {
    const world = open();
    lengthen(round(world), CFG.snakeGorgeTiles + 1);
    press(world, 1, jaws(CFG.snakeJawsMilli));
    expect(snakeMawOpen(world, round(world))).toBe(true);
  });

  it("refuses a carry that did not, and one from the driver", () => {
    const world = open();
    lengthen(round(world), CFG.snakeGorgeTiles + 1);
    press(world, 1, jaws(CFG.snakeJawsMilli - 1));
    expect(snakeMawOpen(world, round(world))).toBe(false);
    press(world, 2, jaws(CFG.snakeJawsMilli));
    expect(snakeMawOpen(world, round(world))).toBe(false);
  });

  /** The mouth is still a window and not a hold: the rest is the whole of it. */
  it("cannot be hauled open again until the mouth has shut", () => {
    const world = open();
    lengthen(round(world), CFG.snakeGorgeTiles + 1);
    press(world, 1, jaws(CFG.snakeJawsMilli));
    const first = round(world).mawTick;
    step(world, []);
    press(world, 1, jaws(CFG.snakeJawsMilli));
    expect(round(world).mawTick).toBe(first);
  });

  it("does nothing at all while the body is still crawling", () => {
    const world = open();
    press(world, 1, jaws(CFG.snakeJawsMilli));
    expect(snakeMawOpen(world, round(world))).toBe(false);
  });
});

describe("the tail, under shed", () => {
  it("lifts its last tiles clear of the arena while her thumb is down", () => {
    const world = open();
    lengthen(round(world), CFG.snakeShedTiles + 1);
    expect(snakeLifted(CFG, round(world))).toBe(0);
    press(world, 2, tail(true));
    expect(round(world).tailHeld).toBe(true);
    expect(snakeLifted(CFG, round(world))).toBe(CFG.snakeTailTiles);
    press(world, 2, tail(false));
    expect(snakeLifted(CFG, round(world))).toBe(0);
  });

  it("is refused to the pilot, and to a body that is not shedding", () => {
    const world = open();
    lengthen(round(world), CFG.snakeShedTiles + 1);
    press(world, 1, tail(true));
    expect(round(world).tailHeld).toBe(false);
    lengthen(round(world), CFG.snakeShedTiles);
    press(world, 2, tail(true));
    expect(round(world).tailHeld).toBe(false);
  });

  /** Never the whole body: a thumb that lifted all of it would turn the round off. */
  it("never lifts more than the body has behind its head", () => {
    const world = open();
    const snake = round(world);
    lengthen(snake, CFG.snakeShedTiles + 1);
    press(world, 2, tail(true));
    snake.body = snake.body.slice(0, 1);
    expect(snakeLifted(CFG, snake)).toBe(0);
  });

  /**
   * And the whole of what it buys: the head goes through the tiles the lifted
   * part is standing on. A body driven into its own tail is a crash, and a
   * crash is the wave lost (`snake-move.ts`).
   */
  it("lets the head pass through where the lifted tail stood", () => {
    const into = (held: boolean): boolean => {
      const world = open();
      const snake = round(world);
      // A body curled so that the tile straight ahead of the head is near
      // its own tail: head going up, the body down one column and back up
      // the next, and the tail brought round in front.
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
      expect(snakeGrip(CFG, snake)).toBe("shed");
      if (held) press(world, 2, tail(true));
      for (let i = 0; i < ROUNDS[0]!.stepTicks + 2; i++) step(world, []);
      return round(world).crashTick >= 0;
    };
    // The tile straight ahead is the third from the tail, so it is among the
    // last `snakeTailTiles` and her thumb takes it off the arena. Driven into
    // with the tail down it is a crash and the wave lost; with the thumb on it
    // the head goes through where the tail was standing.
    expect(into(false)).toBe(true);
    expect(into(true)).toBe(false);
  });
});

describe("her thumb in the fingerprint", () => {
  it("moves the hash, because it moves which tiles kill", () => {
    const world = open();
    lengthen(round(world), CFG.snakeShedTiles + 1);
    const before = hashWorld(world);
    press(world, 2, tail(true));
    expect(hashWorld(world)).not.toBe(before);
  });
});
