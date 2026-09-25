import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import {
  createWorld,
  SNAKE_MORPH_BEATS,
  type SnakeState,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { snakeIntake } from "../src/snake-home.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);
beforeAll(installCanvasGlobals);

/**
 * The mouth on the way home (`snake-home.ts`): shut while the arena is being
 * played, open once it is clear, still open as the next round comes out, and
 * closed behind the last one.
 */

const TPB = ticksPerBeat(CFG);
const MID = Math.floor(CFG.snakeCols / 2);

function playing(): { world: World; snake: SnakeState } {
  const index = waveWith("snake");
  const world = createWorld(CFG, 7, []);
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  const snake = world.boss as SnakeState;
  for (let i = 0; i < (SNAKE_MORPH_BEATS + 1) * TPB && snake.phase !== "play"; i++) {
    step(world, []);
  }
  return { world, snake };
}

/** Every enemy down and every point taken, the head on the floor over the mouth. */
function cleared(world: World, snake: SnakeState): void {
  const round = snake.rounds[snake.round]!;
  snake.struck = round.enemies.map((_, i) => i);
  snake.taken = round.points.map((_, i) => i);
  snake.body = [0, 1, 2].map((i) => ({ col: MID, row: CFG.snakeRows - 1 - i }));
  snake.dirCol = 0;
  snake.dirRow = 1;
  snake.stepTick = world.tick;
}

describe("the mouth on the way home", () => {
  it("is shut while something still stands", () => {
    const { world, snake } = playing();
    expect(snakeIntake(world, 0, snake)).toBe(0);
  });

  it("opens within a beat of the arena being cleared", () => {
    const { world, snake } = playing();
    cleared(world, snake);
    step(world, []);
    expect(snake.clearBeat).toBe(world.beat);
    for (let i = 0; i < TPB + 1; i++) step(world, []);
    expect(snakeIntake(world, 0, snake)).toBe(1);
  });

  it("is still open as the next round starts coming out", () => {
    const { world, snake } = playing();
    cleared(world, snake);
    for (let i = 0; i < 20 * TPB && snake.round === 0; i++) step(world, []);
    expect(snake.phase).toBe("morph");
    expect(snakeIntake(world, 0, snake)).toBe(1);
  });

  it("closes behind the last round", () => {
    const { world, snake } = playing();
    snake.round = snake.rounds.length - 1;
    cleared(world, snake);
    for (let i = 0; i < 20 * TPB && snake.phase === "play"; i++) step(world, []);
    expect(snake.phase).toBe("verdict");
    expect(snakeIntake(world, 0, snake)).toBe(1);
    for (let i = 0; i < TPB + 1; i++) step(world, []);
    expect(snakeIntake(world, 0, snake)).toBe(0);
  });

  for (const role of ROLES) {
    it(`draws the way home on ${role}`, () => {
      const { world, snake } = playing();
      cleared(world, snake);
      const { ctx } = runFrames(world, role, 2 * TPB);
      expect(ctx.calls).toBeGreaterThan(500);
    });
  }
});
