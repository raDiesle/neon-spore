import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinballRound,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { drawPinFuse, pinFuseRest } from "../src/pinball-fuse.js";
import { pinTable } from "../src/pinball-table.js";
import type { ViewState } from "../src/renderer.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  stubCanvas,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **PINBALL's clock is the boss fuse, and the top of the table says nothing
 * else** — the owner, 30 September 2026 (`src/pinball-fuse.ts`). What has to
 * hold: the line burns down over a board and is gone on its last beat, it is
 * drawn only while a board is played, and no word stands over the table.
 */

beforeAll(installCanvasGlobals);

/** A table standing at `play`, with nothing stepping it afterwards. */
function playing(): World {
  const world = createWorld(CFG, 5);
  const index = waveWith("pinball");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < 40 * ticksPerBeat(CFG); i++) {
    if (pinballRound(world)?.phase === "play") return world;
    step(world, []);
  }
  throw new Error("the round never reached play");
}

function round(world: World): PinballState {
  const state = pinballRound(world);
  if (state === null) throw new Error("PINBALL's wave installed no round");
  return state;
}

/** A view is only its world and its phase, as far as the fuse reads it. */
const viewAt = (world: World, beatPhase: number) => ({ world, beatPhase }) as ViewState;

describe("PINBALL's fuse", () => {
  it("is whole on the beat a board opens and burns down over its beats", () => {
    const world = playing();
    const boss = round(world);
    const beats = boss.rounds[boss.round]?.beats ?? 0;
    world.beat = boss.roundBeat;
    expect(pinFuseRest(viewAt(world, 0), boss)).toBe(1);
    world.beat = boss.roundBeat + beats / 2;
    expect(pinFuseRest(viewAt(world, 0), boss)).toBeCloseTo(0.5);
    world.beat = boss.roundBeat + beats - 1;
    expect(pinFuseRest(viewAt(world, 0.999), boss)).toBeLessThan(0.001);
    world.beat = boss.roundBeat + beats + 3;
    expect(pinFuseRest(viewAt(world, 0), boss)).toBe(0);
  });

  it("is drawn only while a board is played", () => {
    const world = playing();
    const boss = round(world);
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const table = pinTable(l, CFG);
    const sparks = (phase: PinballState["phase"]): number => {
      boss.phase = phase;
      const { ctx } = stubCanvas();
      ctx.log = [];
      drawPinFuse(ctx as unknown as CanvasRenderingContext2D, l, table, viewAt(world, 0), boss);
      return ctx.log.filter((e) => e.startsWith("createRadialGradient")).length;
    };
    expect(sparks("play")).toBe(2);
    expect(sparks("morph")).toBe(0);
    expect(sparks("verdict")).toBe(0);
  });

  it("stands at the top of the table, above every piece", () => {
    const world = playing();
    const boss = round(world);
    const l = computeLayout(VIEWPORT, CFG, "p1");
    const table = pinTable(l, CFG);
    const { ctx } = stubCanvas();
    ctx.log = [];
    drawPinFuse(ctx as unknown as CanvasRenderingContext2D, l, table, viewAt(world, 0), boss);
    const ys = ctx.log
      .filter((e) => e.startsWith("fillRect("))
      .map((e) => Number(e.slice("fillRect(".length, -1).split(", ")[1]));
    const top = Math.min(
      ...boss.pieces.map((p) => (p.yMilli - (p.kind === "peg" ? p.wMilli : p.hMilli)) / 1000),
    );
    for (const y of ys) {
      expect(y).toBeGreaterThan(table.y - table.tile);
      expect(y).toBeLessThan(table.y + table.tile * top);
    }
  });

  it("leaves no words over the table while a board is played", () => {
    const world = playing();
    const texts: TextBox[] = [];
    runFrames(world, "p1", 1, {
      every: 1,
      onCanvas: (c) => {
        c.texts = texts;
      },
      onTick: () => {},
    });
    const table = pinTable(computeLayout(VIEWPORT, CFG, "p1"), CFG);
    const over = texts.filter((t) => t.y < table.y + table.tile * 2.5).map((t) => t.text);
    expect(over).toEqual([]);
  });
});
