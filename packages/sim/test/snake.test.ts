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
 * SNAKE, and the sentence it is built to make true: **one of you drives it and
 * the other one works it**.
 *
 * Player 2 has both quarter turns and can see nothing standing in the arena;
 * player 1 has the shot and the mouth and cannot steer. Everything checked
 * here is either that split or what it costs to get it wrong — the four ways
 * an attempt ends, which are one rule wearing four coats.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
/** The wave it is installed on. Any number: it is a wave like any other. */
const WAVE = 6;

/**
 * One round, placed for the rig rather than for a player: the body opens in
 * column 4 heading up, so an enemy at (4,4) is four steps straight ahead and a
 * point at (4,6) is two. The **second** enemy and the second point are in
 * corners nothing here ever reaches, and they are load-bearing: without them,
 * spending the two in the path would clear the arena and move the round on
 * under whichever test was watching it.
 */
const ROUNDS = [
  {
    enemies: [
      { col: 4, row: 4 },
      { col: 8, row: 0 },
    ],
    points: [
      { col: 4, row: 6 },
      { col: 0, row: 0 },
    ],
    rocks: [{ col: 8, row: 10 }],
    beats: 20,
    stepTicks: 60,
  },
  {
    enemies: [{ col: 2, row: 2 }],
    points: [{ col: 6, row: 6 }],
    rocks: [],
    beats: 20,
    stepTicks: 30,
  },
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

/** Ticks to exactly the beat the body starts moving on, and no further. */
function play(world: World): void {
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 2) * TPB; i++) {
    if (round(world).phase === "play") return;
    step(world, []);
  }
  throw new Error("the round never started moving");
}

/** One tick with one press, then nothing for `ticks` more. */
function press(world: World, player: 1 | 2, command: TimedCommand["command"], ticks = 0): void {
  step(world, [cmd(world, player, command)]);
  for (let i = 0; i < ticks; i++) step(world, []);
}

/**
 * Take the two things in the straight line off the board, for a test about
 * something else. The corner pair is deliberately left standing, so the round
 * is still open however far the body drives.
 */
function clearPath(snake: SnakeState): void {
  snake.struck = [0];
  snake.taken = [0];
}

describe("the round opens as a picture before it opens as a game", () => {
  it("installs a body pointing up, and an arena nobody has touched", () => {
    const world = open();
    const snake = round(world);
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
    expect(snake.dirRow).toBe(-1);
    expect(snake.struck).toEqual([]);
    expect(snake.taken).toEqual([]);
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
    press(world, 2, { kind: "snakeTurn", dir: "left" });
    expect(round(world).turn).toBe(0);
    play(world);
    expect(round(world).phase).toBe("play");
  });
});

describe("player 2 drives, and only player 2", () => {
  it("queues a quarter turn and takes it on the next step", () => {
    const world = open();
    play(world);
    const snake = round(world);
    clearPath(snake);
    press(world, 2, { kind: "snakeTurn", dir: "left" });
    expect(snake.turn).toBe(-1);
    for (let i = 0; i < ROUNDS[0]!.stepTicks + 1; i++) step(world, []);
    // Anticlockwise from "up" is "left" on a screen whose rows run down.
    expect([snake.dirCol, snake.dirRow]).toEqual([-1, 0]);
  });

  it("turns the other way for the other button", () => {
    const world = open();
    play(world);
    const snake = round(world);
    clearPath(snake);
    press(world, 2, { kind: "snakeTurn", dir: "right" }, ROUNDS[0]!.stepTicks + 1);
    expect([snake.dirCol, snake.dirRow]).toEqual([1, 0]);
  });

  it("refuses player 1 the wheel", () => {
    const world = open();
    play(world);
    press(world, 1, { kind: "snakeTurn", dir: "left" });
    expect(round(world).turn).toBe(0);
  });

  /**
   * The whole reason a turn is a queued quarter and not a heading: two presses
   * inside one tile are the last one winning, and nothing either of them can
   * press adds up to the reversal the arcade game forbids.
   */
  it("keeps only the last press of a tile, and can never be a half turn", () => {
    const world = open();
    play(world);
    const snake = round(world);
    clearPath(snake);
    press(world, 2, { kind: "snakeTurn", dir: "left" });
    press(world, 2, { kind: "snakeTurn", dir: "right" }, ROUNDS[0]!.stepTicks + 1);
    expect([snake.dirCol, snake.dirRow]).toEqual([1, 0]);
  });
});

describe("player 1 shoots, and only player 1", () => {
  it("takes the enemy that is straight ahead", () => {
    const world = open();
    play(world);
    const snake = round(world);
    press(world, 1, { kind: "snakeFire" });
    expect(snake.struck).toEqual([0]);
    expect(snake.shotHit).toBe(true);
    expect({ col: snake.shotCol, row: snake.shotRow }).toEqual({ col: 4, row: 4 });
  });

  it("misses when the head is not pointing at anything", () => {
    const world = open();
    play(world);
    const snake = round(world);
    press(world, 2, { kind: "snakeTurn", dir: "left" }, ROUNDS[0]!.stepTicks + 1);
    press(world, 1, { kind: "snakeFire" });
    expect(snake.struck).toEqual([]);
    expect(snake.shotHit).toBe(false);
  });

  it("is nobody else's trigger", () => {
    const world = open();
    play(world);
    press(world, 2, { kind: "snakeFire" });
    expect(round(world).struck).toEqual([]);
  });

  it("rests, so a held trigger is not a cleared row", () => {
    const world = open();
    play(world);
    const snake = round(world);
    press(world, 1, { kind: "snakeFire" });
    snake.struck = [];
    press(world, 1, { kind: "snakeFire" });
    expect(snake.struck).toEqual([]);
  });
});

describe("the mouth is player 1's, and it is a moment rather than a state", () => {
  it("swallows a point driven over with it open", () => {
    const world = open();
    play(world);
    const snake = round(world);
    // Two steps to the point at (4,6), with the enemy beyond it already down.
    snake.struck = [0];
    for (let i = 0; i < ROUNDS[0]!.stepTicks * 2 - 20; i++) step(world, []);
    press(world, 1, { kind: "snakeMaw" }, 40);
    expect(snake.taken).toEqual([0]);
    expect(snake.repeats).toBe(0);
    expect(snake.body.length).toBeGreaterThan(CFG.snakeStartTiles);
  });

  it("starts the round over when the same point is reached with it shut", () => {
    const world = open();
    play(world);
    const snake = round(world);
    snake.struck = [0];
    const hull = world.hullMilli;
    for (let i = 0; i < ROUNDS[0]!.stepTicks * 2 + 2; i++) step(world, []);
    expect(snake.taken).toEqual([]);
    expect(snake.repeats).toBe(1);
    expect(world.hullMilli).toBeLessThan(hull);
    // And the round is standing again, whole.
    expect(snake.struck).toEqual([]);
    expect(snake.body.length).toBe(CFG.snakeStartTiles);
  });

  it("is nobody else's mouth", () => {
    const world = open();
    play(world);
    press(world, 2, { kind: "snakeMaw" });
    expect(world.tick - round(world).mawTick).toBeGreaterThan(CFG.snakeMawTicks);
  });
});

describe("the four ways an attempt ends, which are one rule", () => {
  it("starts over on the wall", () => {
    const world = open();
    play(world);
    const snake = round(world);
    clearPath(snake);
    const hull = world.hullMilli;
    for (let i = 0; i < ROUNDS[0]!.stepTicks * (CFG.snakeRows + 2); i++) step(world, []);
    expect(snake.repeats).toBeGreaterThan(0);
    expect(world.hullMilli).toBeLessThan(hull);
    expect(snake.phase).toBe("play");
  });

  it("starts over on an enemy nobody shot", () => {
    const world = open();
    play(world);
    const snake = round(world);
    // The point two steps ahead is already swallowed, so the straight line
    // holds nothing but the enemy at four.
    snake.taken = [0];
    for (let i = 0; i < ROUNDS[0]!.stepTicks * 4 + 2; i++) step(world, []);
    expect(snake.repeats).toBe(1);
    expect(snake.body[0]).toEqual({ col: 4, row: CFG.snakeRows - 3 });
  });
});

describe("the rounds, and the two ways out of them", () => {
  it("opens the next one once the arena is clear", () => {
    const world = open();
    play(world);
    const snake = round(world);
    snake.struck = [0, 1];
    snake.taken = [0, 1];
    step(world, []);
    expect(snake.round).toBe(1);
    expect(snake.struck).toEqual([]);
    expect(snake.roundBeat).toBe(world.beat);
  });

  it("passes when the last one is cleared, and holds its own picture after", () => {
    const world = open();
    play(world);
    const snake = round(world);
    snake.round = ROUNDS.length - 1;
    snake.struck = [0];
    snake.taken = [0];

    step(world, []);
    expect(snake.phase).toBe("verdict");
    expect(snake.passed).toBe(true);
    // Spent rather than gone: the round stays installed so the field — with
    // its hull and its ship — does not come back for the beats of rest before
    // the next wave (`sim/wave-end.ts`).
    for (let i = 0; i < 6 * TPB; i++) step(world, []);
    expect(snake.phase).toBe("spent");
    expect(snakeRound(world)).not.toBeNull();
  });

  it("costs the hull when the clock runs out, and says so", () => {
    const world = open();
    play(world);
    const snake = round(world);
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
