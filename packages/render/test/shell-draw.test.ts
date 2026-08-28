import { beforeAll, describe, expect, it } from "bun:test";
import {
  createWorld,
  DEFAULT_CONFIG,
  type SimConfig,
  type SimEvent,
  type SpawnEntry,
  shellIsBare,
  shellPiecesLeft,
  step,
  type TimedCommand,
  ticksPerBeat,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawShellDamage } from "../src/shell-draw.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The pass that draws the wound a bared piece leaves — see `shell-draw.ts`'s
 * own doc for why it needs no cached state at all. This file proves three
 * things a screenshot cannot: the strict canvas stub accepts every value it
 * is handed in every one of the shell's states, the pass actually draws
 * something once — and only once — a piece is off, and it stops drawing that
 * piece's bite the moment the body goes bare, when the whole picture becomes
 * the exposed core instead.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const TPB = ticksPerBeat(CFG);
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "test");
const COL = 3;

const shell = (col: number): SpawnEntry => ({ beat: 0, col, kind: "shell", color: null });
const aim = (tick: number, col: number): TimedCommand => ({
  tick,
  player: 1,
  command: { kind: "cannonCol", col },
});
const fire = (tick: number, color: "red" | "cyan"): TimedCommand => ({
  tick,
  player: 2,
  command: { kind: "fire", color },
});
function shot(tick: number, col: number, color: "red" | "cyan"): TimedCommand[] {
  return [aim(tick, col), fire(tick, color)];
}

interface Run {
  world: ReturnType<typeof createWorld>;
  events: SimEvent[];
}

function run(queue: SpawnEntry[], ticks: number, inputs: TimedCommand[] = []): Run {
  const world = createWorld({ ...CFG }, 0, queue);
  const byTick = new Map<number, TimedCommand[]>();
  for (const i of inputs) byTick.set(i.tick, [...(byTick.get(i.tick) ?? []), i]);
  const events: SimEvent[] = [];
  for (let t = 0; t < ticks; t++) {
    step(world, byTick.get(t) ?? []);
    events.push(...world.events);
  }
  return { world, events };
}

/** Draw a handful of frames across a spread of `beatPhase`/`time`, so the
 * sway and the depth envelope both get exercised, not only `t = 0`. */
function drawFrames(world: ReturnType<typeof createWorld>): number {
  const { ctx } = stubCanvas();
  for (let i = 0; i < 30; i++) {
    const beatPhase = (i % 10) / 10;
    const time = i * 0.083;
    drawShellDamage(ctx as unknown as CanvasRenderingContext2D, L, world, beatPhase, time);
  }
  return ctx.calls;
}

beforeAll(installCanvasGlobals);

describe("the shell's wound", () => {
  it("draws nothing while every piece is still on", () => {
    const { world } = run([shell(COL)], TPB + 1);
    expect(shellPiecesLeft(world.creatures[0]!)).toBe(2);
    expect(drawFrames(world)).toBe(0);
  });

  it("draws the bite once a piece is off, through the strict canvas stub", () => {
    const { world } = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    const body = world.creatures[0]!;
    expect(shellPiecesLeft(body)).toBe(1);
    expect(drawFrames(world)).toBeGreaterThan(0);
  });

  it("draws a bite for whichever column's piece actually came off", () => {
    const left = run([shell(COL)], TPB * 4, shot(TPB * 2, COL, "red"));
    const right = run([shell(COL)], TPB * 4, shot(TPB * 2, COL + 1, "cyan"));
    expect(drawFrames(left.world)).toBeGreaterThan(0);
    expect(drawFrames(right.world)).toBeGreaterThan(0);
  });

  it("stops drawing a bite once the core is bare — the whole body is the wound now", () => {
    const inputs = [...shot(TPB * 2, COL, "red"), ...shot(TPB * 3, COL + 1, "red")];
    const { world } = run([shell(COL)], TPB * 5, inputs);
    const body = world.creatures[0]!;
    expect(shellIsBare(body)).toBe(true);
    expect(drawFrames(world)).toBe(0);
  });

  it("draws nothing at all when there is no shelled body on the field", () => {
    const { world } = run([], 1);
    expect(drawFrames(world)).toBe(0);
  });
});
