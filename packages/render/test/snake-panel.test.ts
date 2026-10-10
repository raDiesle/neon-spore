import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss } from "@neon-spore/content";
import { createWorld, type SnakeState, startWave, type World } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import type { ViewState } from "../src/renderer.js";
import { snakeLayout } from "../src/snake-layout.js";
import { drawVerdict, snakeFuseRest } from "../src/snake-panel.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  ROLES,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

/**
 * **What stands around SNAKE's arena since 10 October 2026** — the owner's
 * four asks on the round's picture (`snake-panel.ts`, `snake-layout.ts`): the
 * boss fuse in place of the header, nothing over a crash, and big buttons.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

beforeAll(installCanvasGlobals);

function round(): { world: World; snake: SnakeState } {
  const world = createWorld(CFG, 7, []);
  const index = waveWith("snake");
  startWave(world, index, [], [], buildBoss(index, CFG.cols));
  const snake = world.boss;
  if (snake?.kind !== "snake") throw new Error("SNAKE's wave installed no round");
  snake.phase = "play";
  snake.roundBeat = world.beat;
  return { world, snake };
}

const view = (world: World): ViewState => ({ world, beatPhase: 0 }) as unknown as ViewState;

describe("SNAKE's fuse", () => {
  it("is whole as an attempt opens and burns down over its beats", () => {
    const { world, snake } = round();
    expect(snakeFuseRest(view(world), snake, false)).toBe(1);
    const beats = snake.rounds[snake.round]?.beats ?? 0;
    world.beat += beats / 2;
    expect(snakeFuseRest(view(world), snake, false)).toBeCloseTo(0.5, 5);
  });

  it("is out while the body comes out, once the arena is cleared, and after a crash", () => {
    const { world, snake } = round();
    expect(snakeFuseRest(view(world), snake, true)).toBe(0);
    snake.clearBeat = world.beat;
    expect(snakeFuseRest(view(world), snake, false)).toBe(0);
    snake.clearBeat = -1;
    snake.phase = "morph";
    expect(snakeFuseRest(view(world), snake, false)).toBe(0);
  });
});

describe("SNAKE's verdict", () => {
  it("draws nothing over a crash, and still says a clock run out", () => {
    const { snake } = round();
    const l = computeLayout(VIEWPORT, CFG, "p1");
    snake.passed = false;
    const crashed = stubCanvas().ctx;
    drawVerdict(crashed as unknown as CanvasRenderingContext2D, l, snake, true);
    expect(crashed.calls).toBe(0);
    const late = stubCanvas().ctx;
    drawVerdict(late as unknown as CanvasRenderingContext2D, l, snake, false);
    expect(late.calls).toBeGreaterThan(0);
  });
});

describe("SNAKE's buttons", () => {
  it("are bigger than the short band would make them, and inside it", () => {
    const { world } = round();
    for (const role of ROLES) {
      const plain = computeLayout(VIEWPORT, CFG, role, CFG.snakeHullPct / 100);
      const l = snakeLayout(computeLayout(VIEWPORT, CFG, role), world);
      expect(l.lobeR, role).toBeGreaterThan(plain.lobeR * 1.5);
      expect(l.lobeY - l.lobeR, role).toBeGreaterThanOrEqual(l.bandTop - l.lobeR * 0.5);
      expect(l.lobeY + l.lobeR, role).toBeLessThanOrEqual(l.height);
    }
  });
});
