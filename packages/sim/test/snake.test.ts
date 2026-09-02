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
import { SNAKE_MORPH_BEATS } from "../src/snake-round.js";

/**
 * SNAKE, and the one sentence it is built to make true: **neither seat can
 * turn a corner**.
 *
 * Player 1 has left and right, player 2 has up and down, and a turn only ever
 * counts across the way the body is already going. Everything else in the
 * round — the pellets, the clock, the crash, the two buttons — exists to make
 * that sentence cost something, so most of what is checked here is the split
 * itself and what happens to a pair who get it wrong.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;

/**
 * Two rounds, and the first target is deliberately past anything one pickup
 * can reach: a target of two would be passed by the orb alone, and half the
 * tests below would then be reading a round that had already moved on.
 */
const ROUNDS = [
  { points: 6, beats: 20, stepTicks: 60 },
  { points: 3, beats: 20, stepTicks: 30 },
];

function open(seed = 3): World {
  const world = createWorld(CFG, seed);
  startWave(world, WAVE, [], [], { kind: "snake", rounds: ROUNDS });
  return world;
}

function round(world: World): SnakeState {
  const snake = snakeRound(world);
  if (snake === null) throw new Error("no round running");
  return snake;
}

function cmd(world: World, player: 1 | 2, command: TimedCommand["command"]): TimedCommand {
  return { tick: world.tick, player, command };
}

/**
 * Ticks to exactly the beat the body starts moving on, and no further. The
 * step interval is counted from there, so a rig that overshot would be reading
 * a body somewhere in the middle of an interval it did not choose.
 */
function play(world: World): void {
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 2) * TPB; i++) {
    if (round(world).phase === "play") return;
    step(world, []);
  }
  throw new Error("the round never started moving");
}

/** One tick with one press, and then nothing for `ticks` more. */
function press(world: World, player: 1 | 2, command: TimedCommand["command"], ticks = 0): void {
  step(world, [cmd(world, player, command)]);
  for (let i = 0; i < ticks; i++) step(world, []);
}

/** Where the pellet cannot be reached by accident. */
function parkPellet(snake: SnakeState): void {
  snake.pelletCol = -5;
  snake.pelletRow = -5;
  snake.orbCol = -5;
  snake.orbRow = -5;
}

describe("the round opens as a picture before it opens as a game", () => {
  it("installs a body, a heading and a pellet", () => {
    const world = open();
    const snake = round(world);
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
    expect(snake.dirRow).toBe(-1);
    expect(snake.pelletCol).toBeGreaterThanOrEqual(0);
    expect(snake.pelletRow).toBeGreaterThanOrEqual(0);
  });

  it("holds the body still while the ship is still becoming it", () => {
    const world = open();
    const before = round(world).body.map((t) => ({ ...t }));
    for (let i = 0; i < SNAKE_MORPH_BEATS * TPB - 1; i++) step(world, []);
    expect(round(world).phase).toBe("morph");
    expect(round(world).body).toEqual(before);
  });

  it("hears nothing until it does", () => {
    const world = open();
    press(world, 1, { kind: "snakeTurn", dir: "left" });
    expect(round(world).turnCol).toBe(0);
    play(world);
    expect(round(world).phase).toBe("play");
  });
});

describe("a corner is two seats, in order", () => {
  it("takes player 1 across an upward body", () => {
    const world = open();
    play(world);
    press(world, 1, { kind: "snakeTurn", dir: "left" });
    expect(round(world).turnCol).toBe(-1);
  });

  it("refuses player 2 the same turn", () => {
    const world = open();
    play(world);
    press(world, 2, { kind: "snakeTurn", dir: "left" });
    expect(round(world).turnCol).toBe(0);
  });

  it("refuses player 2 an upward body's own axis, which is the 180", () => {
    const world = open();
    play(world);
    press(world, 2, { kind: "snakeTurn", dir: "down" });
    expect(round(world).turnRow).toBe(-1);
  });

  it("hands the axis over once the body has actually turned", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    press(world, 1, { kind: "snakeTurn", dir: "right" }, ROUNDS[0]!.stepTicks + 1);
    expect(snake.dirCol).toBe(1);
    // Now it is going sideways, so player 1 is the one who cannot steer.
    press(world, 1, { kind: "snakeTurn", dir: "left" });
    expect(snake.turnCol).toBe(1);
    press(world, 2, { kind: "snakeTurn", dir: "down" });
    expect(snake.turnRow).toBe(1);
  });

  /**
   * The whole reason a turn is queued rather than applied. Two presses inside
   * one tile, each of them legal on its own, must not add up to a body driven
   * into its own neck — neither player asked for that and neither could see it
   * coming.
   */
  it("cannot be talked into a reversal by two legal presses", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    press(world, 1, { kind: "snakeTurn", dir: "left" });
    press(world, 2, { kind: "snakeTurn", dir: "down" });
    // The second press is judged against the direction actually travelled,
    // which is still up — so it is refused and the queued left stands.
    expect(snake.turnCol).toBe(-1);
    expect(snake.turnRow).toBe(0);
  });
});

describe("the body moves on its own clock", () => {
  it("steps exactly once an authored interval", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    const head = { ...snake.body[0]! };
    for (let i = 0; i < ROUNDS[0]!.stepTicks - 1; i++) step(world, []);
    expect(snake.body[0]).toEqual(head);
    step(world, []);
    expect(snake.body[0]).toEqual({ col: head.col, row: head.row - 1 });
  });

  it("keeps its length until something is eaten", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    for (let i = 0; i < ROUNDS[0]!.stepTicks * 2; i++) step(world, []);
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
  });
});

describe("player 2's brake buys about a tile, once", () => {
  it("delays the next step and is spent by it", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    const head = { ...snake.body[0]! };
    press(world, 2, { kind: "snakeSlow" });
    expect(snake.slowTicks).toBeGreaterThan(0);
    for (let i = 0; i < ROUNDS[0]!.stepTicks; i++) step(world, []);
    // Still where it was: the brake pushed the step past the interval.
    expect(snake.body[0]).toEqual(head);
    for (let i = 0; i < snake.slowTicks + 1; i++) step(world, []);
    expect(snake.body[0]).not.toEqual(head);
    expect(snake.slowTicks).toBe(0);
  });

  it("is nobody else's button", () => {
    const world = open();
    play(world);
    press(world, 1, { kind: "snakeSlow" });
    expect(round(world).slowTicks).toBe(0);
  });

  it("rests, so a held thumb is not simply a slower snake", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    press(world, 2, { kind: "snakeSlow" });
    snake.slowTicks = 0;
    press(world, 2, { kind: "snakeSlow" });
    expect(snake.slowTicks).toBe(0);
  });
});

describe("player 1's flip is the answer to a corner nobody can turn", () => {
  it("swaps the ends and sets off away from the body", () => {
    const world = open();
    play(world);
    const snake = round(world);
    const tail = { ...snake.body[snake.body.length - 1]! };
    press(world, 1, { kind: "snakeFlip" });
    expect(snake.body[0]).toEqual(tail);
    // The body ran up the screen, so the old tail leaves down it.
    expect(snake.dirRow).toBe(1);
    expect(snake.turnRow).toBe(1);
  });

  it("is nobody else's button", () => {
    const world = open();
    play(world);
    const snake = round(world);
    const head = { ...snake.body[0]! };
    press(world, 2, { kind: "snakeFlip" });
    expect(snake.body[0]).toEqual(head);
  });
});

describe("what is collected, and what it costs", () => {
  it("scores a pellet, grows by it and drops another somewhere else", () => {
    const world = open();
    play(world);
    const snake = round(world);
    const head = snake.body[0]!;
    snake.pelletCol = head.col;
    snake.pelletRow = head.row - 1;
    for (let i = 0; i < ROUNDS[0]!.stepTicks + 1; i++) step(world, []);
    expect(snake.points).toBe(CFG.snakePelletPoints);
    expect(snake.body.length).toBeGreaterThan(CFG.snakeStartTiles);
    expect({ col: snake.pelletCol, row: snake.pelletRow }).not.toEqual({
      col: head.col,
      row: head.row - 1,
    });
  });

  it("scores the orb without growing anything", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    const head = snake.body[0]!;
    snake.orbCol = head.col;
    snake.orbRow = head.row - 1;
    for (let i = 0; i < ROUNDS[0]!.stepTicks + 1; i++) step(world, []);
    expect(snake.points).toBe(CFG.snakeOrbPoints);
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
    expect(snake.orbCol).toBe(-1);
  });

  it("breaks the hull on a wall and puts the body back, with the round still on", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    const hull = world.hullMilli;
    for (let i = 0; i < ROUNDS[0]!.stepTicks * (CFG.snakeRows + 2); i++) step(world, []);
    expect(snake.crashes).toBeGreaterThan(0);
    expect(world.hullMilli).toBeLessThan(hull);
    expect(snake.phase).toBe("play");
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
  });
});

describe("the rounds, and the two ways out of them", () => {
  it("opens the next one on its target, faster and back at nothing", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    snake.points = ROUNDS[0]!.points;
    step(world, []);
    expect(snake.round).toBe(1);
    expect(snake.points).toBe(0);
    expect(snake.roundBeat).toBe(world.beat);
  });

  it("passes when the last one is passed, and stands there before it goes", () => {
    const world = open();
    play(world);
    const snake = round(world);
    snake.round = ROUNDS.length - 1;
    snake.points = ROUNDS[1]!.points;
    step(world, []);
    expect(snake.phase).toBe("verdict");
    expect(snake.passed).toBe(true);
    for (let i = 0; i < 6 * TPB; i++) step(world, []);
    expect(snakeRound(world)).toBeNull();
  });

  it("costs the hull when the clock runs out, and says so", () => {
    const world = open();
    play(world);
    const snake = round(world);
    parkPellet(snake);
    const hull = world.hullMilli;
    snake.roundBeat = world.beat - ROUNDS[0]!.beats;
    step(world, []);
    expect(snake.phase).toBe("verdict");
    expect(snake.passed).toBe(false);
    expect(world.hullMilli).toBeLessThan(hull);
  });
});

describe("the field is gone while it stands", () => {
  it("spawns nothing, and the wave's own clock stands still", () => {
    const world = open();
    play(world);
    expect(world.creatures.length).toBe(0);
    expect(world.waveBeat).toBe(0);
    // The metronome is not the wave: the beat keeps going, because the round's
    // own clock is counted in it.
    expect(world.beat).toBeGreaterThan(0);
  });
});
