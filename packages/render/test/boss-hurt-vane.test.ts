import { beforeAll, describe, expect, it, setDefaultTimeout, spyOn } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, step, ticksPerBeat, type World } from "@neon-spore/sim";
import { BossBlows } from "../src/boss-blows.js";
import { BossHurt } from "../src/boss-hurt.js";
import { PALETTE } from "../src/palette.js";
import {
  CFG,
  FRAME_TIMEOUT_MS,
  installCanvasGlobals,
  runFrames,
  waveWith,
} from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE VANE's blow, which `boss-hurt.test.ts`'s table cannot hold: a pin
 * knocked out of the bearing pushes no event, so the blow is a count of pins
 * lower than the last frame drew (`boss-blows.ts`), and the case here takes a
 * pin away rather than pushing a landing.
 */

beforeAll(installCanvasGlobals);

describe("THE VANE's blow", () => {
  it("is a pin fewer than last frame, never a pin more, and forgotten on a restart", () => {
    const blows = new BossBlows();
    expect(blows.seeVane(3).value).toBe(0);
    expect(blows.seeVane(3).value).toBe(0);
    expect(blows.seeVane(2).value).toBe(1);
    blows.vane.clear();
    // A new fight's bearing comes back full, which is no blow.
    expect(blows.seeVane(3).value).toBe(0);
    blows.clear();
    expect(blows).toEqual(new BossBlows());
    // And a restart's first frame has nothing to compare against.
    expect(blows.seeVane(1).value).toBe(0);
  });

  it("washes the hub and the spar red on the frames after a pin goes", () => {
    const rims = (dealt: boolean): number => {
      const off = dealt ? null : spyOn(BossHurt.prototype, "hit").mockImplementation(() => {});
      const log: string[] = [];
      runFrames(fourBeatsIn(), "p1", 9, {
        every: 3,
        onCanvas: (c) => {
          c.log = log;
        },
        onTick: (tick, w) => {
          step(w, []);
          if (tick === 4 && w.boss?.kind === "vane") w.boss.pins -= 1;
        },
      });
      off?.mockRestore();
      return log.join("|").split(PALETTE.redRim).length;
    };
    expect(rims(true)).toBeGreaterThan(rims(false));
  });
});

function fourBeatsIn(): World {
  const world = createWorld(CFG, 3);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  for (let i = 0; i < ticksPerBeat(CFG) * 4; i++) step(world, []);
  if (world.boss?.kind !== "vane") throw new Error("the vane wave hung no arm");
  return world;
}
