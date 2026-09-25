import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import {
  createWorld,
  instarBoss,
  startWave,
  step,
  ticksPerBeat,
  type World,
} from "@neon-spore/sim";
import { BossHurt } from "../src/boss-hurt.js";
import { Effects } from "../src/effects.js";
import { InstarFx } from "../src/instar-fx.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
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
 * A boss the pair got the better of shows it took the blow — the owner's
 * generic rule of 24 September 2026 (`boss-hurt.ts`): a shake and a red
 * glow on the body for a moment after a sequence lands, and nothing after
 * one mark alone. THE INSTAR is the first to wear it.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "test");

describe("the blow a boss takes", () => {
  it("shows at once and is over within half a second", () => {
    const hurt = new BossHurt();
    expect(hurt.value).toBe(0);
    expect(Math.abs(hurt.shakeX(1, 40))).toBe(0);
    hurt.hit();
    expect(hurt.value).toBe(1);
    for (let i = 0; i < 29; i++) hurt.update(1 / 60);
    expect(hurt.value).toBeGreaterThan(0);
    for (let i = 0; i < 2; i++) hurt.update(1 / 60);
    expect(hurt.value).toBe(0);
  });

  it("is dealt to THE INSTAR by a landed step and its last, not by one mark done", () => {
    const fx = new InstarFx();
    fx.ingest([{ type: "instarDone", mark: 0, part: "jaw", col: 3 }], L, () => {});
    expect(fx.hurt.value).toBe(0);
    fx.ingest([{ type: "instarLand", step: 0, col: 3 }], L, () => {});
    expect(fx.hurt.value).toBe(1);
    fx.clear();
    expect(fx.hurt.value).toBe(0);
    fx.ingest([{ type: "instarDown", col: 3 }], L, () => {});
    expect(fx.hurt.value).toBe(1);
  });

  it("washes THE INSTAR's body red on the frames after a landing", () => {
    const rims = (land: boolean): number => {
      const world = morphing();
      const log: string[] = [];
      runFrames(world, "p1", 6, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (land && tick === 0) w.events.push({ type: "instarLand", step: 0, col: 3 });
        },
      });
      return log.join("|").split(PALETTE.redRim).length;
    };
    expect(rims(true)).toBeGreaterThan(rims(false));
  });

  it("is a transient the next run does not inherit", () => {
    const fx = new Effects();
    fx.ingest([{ type: "instarLand", step: 0, col: 3 }], L, 0, () => 0, CFG);
    expect(fx.boss.instar.hurt.value).toBeGreaterThan(0);
    fx.reset();
    expect(fx).toEqual(new Effects());
  });
});

/** THE INSTAR at the start of its second step's morph: no mark is up yet. */
function morphing(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("instar");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  const s = instarBoss(world);
  if (s === null) throw new Error("the instar wave hung no body");
  s.cursor = 1;
  s.phase = "morph";
  s.phaseBeat = world.beat;
  return world;
}
