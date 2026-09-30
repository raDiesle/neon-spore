import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  type PinballState,
  pinballRound,
  pinCannonMilli,
  pinHeightMilli,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { pinCatch01, pinCatchScale } from "../src/pinball-catch.js";
import { pinTable } from "../src/pinball-table.js";
import type { ViewState } from "../src/renderer.js";
import type { TextBox } from "./canvas-stub.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  VIEWPORT,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **A ball caught back in the cannon says YEAH** — the owner, 30 September
 * 2026 (`src/pinball-catch.ts`). What has to hold: the sim stamps the catch on
 * its tick, the cheer starts on that tick and is over in under a second, the
 * word pops past its size before it settles, and it is drawn over the mouth
 * and inside the table.
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

const viewAt = (world: World) => ({ world, beatPhase: 0 }) as ViewState;

describe("PINBALL's catch", () => {
  it("is stamped on the tick a ball comes down into the mouth", () => {
    const world = playing();
    const boss = round(world);
    boss.shot = "flight";
    boss.flightBeat = world.beat;
    boss.ball.xMilli = pinCannonMilli(world.cfg, world.cannonCol);
    boss.ball.yMilli = pinHeightMilli(world.cfg) - 5;
    boss.ball.vxMilli = 0;
    boss.ball.vyMilli = 60;
    const drops = boss.drops;
    for (let i = 0; i < 4 && boss.catchTick < 0; i++) step(world, []);
    expect(boss.catchTick).toBeGreaterThanOrEqual(0);
    expect(boss.catchTick).toBeLessThanOrEqual(world.tick);
    expect(boss.drops).toBe(drops);
  });

  it("starts whole on the catch and is gone inside a second", () => {
    const world = playing();
    const boss = round(world);
    expect(pinCatch01(viewAt(world), boss)).toBe(0);
    boss.catchTick = world.tick;
    expect(pinCatch01(viewAt(world), boss)).toBe(1);
    world.tick += 60;
    const half = pinCatch01(viewAt(world), boss);
    expect(half).toBeGreaterThan(0);
    expect(half).toBeLessThan(1);
    world.tick += ticksPerBeat(CFG) * 2;
    expect(pinCatch01(viewAt(world), boss)).toBe(0);
    // A counter that went backwards is a restart, not a catch still to come.
    boss.catchTick = world.tick + 10;
    expect(pinCatch01(viewAt(world), boss)).toBe(0);
  });

  it("pops the word past its size before it settles", () => {
    expect(pinCatchScale(0)).toBe(0);
    let top = 0;
    for (let g = 0; g <= 1; g += 0.01) top = Math.max(top, pinCatchScale(g));
    expect(top).toBeGreaterThan(1.2);
    expect(pinCatchScale(0.5)).toBe(1);
    expect(pinCatchScale(1)).toBe(1);
  });

  it("draws YEAH! over the cannon, inside the table, in every column", () => {
    for (const col of [0, Math.floor(CFG.cols / 2), CFG.cols - 1]) {
      const world = playing();
      const boss = round(world);
      world.cannonCol = col;
      const texts: TextBox[] = [];
      runFrames(world, "p1", 1, {
        every: 1,
        onCanvas: (c) => {
          c.texts = texts;
        },
        onTick: (_, w) => {
          boss.catchTick = w.tick - 30;
        },
      });
      const table = pinTable(computeLayout(VIEWPORT, CFG, "p1"), CFG);
      const box = texts.find((t) => t.text === "YEAH!");
      if (box === undefined) throw new Error(`no YEAH! with the cannon in column ${col}`);
      // The box is in device pixels, the table in the layout's.
      const d = VIEWPORT.dpr;
      const word = { x: box.x / d, y: box.y / d, w: box.w / d, h: box.h / d };
      expect(word.x).toBeGreaterThanOrEqual(table.x);
      expect(word.x + word.w).toBeLessThanOrEqual(table.x + table.tile * table.cols);
      expect(word.y).toBeGreaterThan(table.y);
      expect(word.y + word.h).toBeLessThan(table.y + table.tile * table.rows);
    }
  });
});
