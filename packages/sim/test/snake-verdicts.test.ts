import { expect, test } from "bun:test";
import {
  type Command,
  createWorld,
  DEFAULT_CONFIG,
  type SimEvent,
  type SnakeState,
  snakeJawsAsks,
  snakeRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "../src/index.js";
import { snakeHeard } from "../src/snake-controls.js";
import { SNAKE_MORPH_BEATS } from "../src/snake-round.js";

/**
 * SNAKE's jaws answering a touch the way every mark does: when they are asked
 * of the pilot (`snakeJawsAsks`), and a press from the driver on them said
 * once as a refusal (`snakeRefuse`) and doing nothing else.
 * `snake-body.test.ts` holds the prise itself.
 */

const CFG = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const GORGE = CFG.snakeGorgeTiles + 1;

const ROUNDS = [
  {
    enemies: [{ col: CFG.snakeCols - 1, row: 0 }],
    points: [{ col: 0, row: 0 }],
    rocks: [],
    beats: 40,
    stepTicks: 60,
  },
];

/** A round in its play with a body `tiles` long, and the mouth rested. */
function playing(tiles: number): { world: World; snake: SnakeState } {
  const world = createWorld(CFG, 3);
  startWave(world, 6, [], [], { kind: "snake", rounds: ROUNDS });
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 2) * TPB; i++) {
    if (snakeRound(world)?.phase === "play") break;
    step(world, []);
  }
  const snake = snakeRound(world);
  if (snake === null || snake.phase !== "play") throw new Error("the round never started moving");
  const head = snake.body[0];
  if (head === undefined) throw new Error("a body with no head");
  snake.body = Array.from({ length: tiles }, (_, i) => ({ col: head.col, row: head.row + i }));
  snake.mawTick = world.tick - CFG.snakeMawRestTicks;
  return { world, snake };
}

const jaws = (on: boolean): Command => ({
  kind: "drag",
  target: "snakeJaws",
  on,
  fromMilli: 0,
  fromYMilli: on ? 0 : CFG.snakeJawsMilli,
});

/** What one command says, and nothing said before it. */
function said(world: World, snake: SnakeState, player: 1 | 2, command: Command): SimEvent[] {
  world.events.length = 0;
  snakeHeard(world, snake, player, command);
  return world.events.filter((e) => e.type.startsWith("snake"));
}

test("the jaws are asked past crawl with the mouth rested, and not through a crash", () => {
  const short = playing(CFG.snakeGorgeTiles);
  expect(snakeJawsAsks(CFG, short.snake, short.world.tick)).toBe(false);
  const gorged = playing(GORGE);
  expect(snakeJawsAsks(CFG, gorged.snake, gorged.world.tick)).toBe(true);
  gorged.snake.mawTick = gorged.world.tick;
  expect(snakeJawsAsks(CFG, gorged.snake, gorged.world.tick)).toBe(false);
  const crashed = playing(GORGE);
  crashed.snake.crashTick = crashed.world.tick;
  expect(snakeJawsAsks(CFG, crashed.snake, crashed.world.tick)).toBe(false);
});

test("the driver's thumb on the asked jaws is refused once, on the press alone", () => {
  const { world, snake } = playing(GORGE);
  const head = snake.body[0];
  expect(said(world, snake, 2, jaws(true))).toEqual([
    { type: "snakeRefuse", col: head?.col ?? -1, row: head?.row ?? -1, part: "jaws", player: 2 },
  ]);
  expect(said(world, snake, 2, jaws(false))).toEqual([]);
  // And it opened nothing: the pilot's own prise is still there to be had.
  expect(said(world, snake, 1, jaws(false))).toEqual([
    { type: "snakePrise", col: head?.col ?? -1, row: head?.row ?? -1 },
  ]);
});

test("jaws not asked refuse nobody", () => {
  const short = playing(CFG.snakeGorgeTiles);
  expect(said(short.world, short.snake, 2, jaws(true))).toEqual([]);
  const resting = playing(GORGE);
  resting.snake.mawTick = resting.world.tick;
  expect(said(resting.world, resting.snake, 2, jaws(true))).toEqual([]);
});
