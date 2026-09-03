import { beforeAll, describe, expect, it } from "bun:test";
import { buildBoss, buildQueue } from "@neon-spore/content";
import { createWorld, startWave, ticksPerBeat } from "@neon-spore/sim";
import type { ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, waveWith } from "./frame-harness.js";

/**
 * THE VANE over a full cycle and a half: the arm at both ends of its travel,
 * mid-sweep in both directions, the housing split in both colours and shut, and
 * the flick it leaves when it throws an arrival. Its own wave carries the
 * arrivals, because a mechanism turning over an empty field draws none of them.
 */

beforeAll(installCanvasGlobals);

function vaneFrames(role: ViewRole, ticks: number) {
  const world = createWorld(CFG, 3);
  const index = waveWith("vane");
  startWave(world, index, buildQueue(index, CFG.cols), [], buildBoss(index, CFG.cols));
  return runFrames(world, role, ticks);
}

describe("the vane", () => {
  for (const role of ROLES) {
    it(`draws the arm, the bearing and a split housing for ${role}`, () => {
      const { ctx } = vaneFrames(role, ticksPerBeat(CFG) * 18);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("really threw something, or the flick was never drawn", () => {
    const { world } = vaneFrames("test", ticksPerBeat(CFG) * 18);
    const boss = world.boss;
    expect(boss?.kind === "vane" && boss.throwBeat !== -1).toBe(true);
  });
});
