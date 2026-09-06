import { beforeAll, describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, type SpawnEntry, ticksPerBeat } from "@neon-spore/sim";
import { showsFenceGaps } from "../src/fence.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, VIEWPORT } from "./frame-harness.js";

/**
 * THE FENCE, drawn: the wall both seats see, and the breaks only the pilot has.
 *
 * Nothing here can answer whether a line of current *reads* as one at thirty
 * pixels — that is the check this lane owes and it needs an eye. What it can
 * hold is the shape of the arrangement: that a body covering every column of
 * the field never hands the canvas a coordinate it refuses, that the gaps are
 * drawn on one seat and not the other, and that a wall open against either
 * wall — or open in several places at once — still puts its filament somewhere
 * a canvas will take.
 */

beforeAll(installCanvasGlobals);

function fenceFrames(role: ViewRole, gaps: number[], ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col: 0, kind: "fence", color: null, gaps }];
  // Every second tick: the filament crackles inside one beat and the wall
  // crosses the field in six, so a sampling that only caught beat boundaries
  // would draw a handful of frames of the fastest thing in the wave.
  return runFrames(createWorld(CFG, 1, queue), role, ticks, {
    every: 2,
    controls: controlSet("default"),
  });
}

describe("the fence", () => {
  // Past the hull, so every frame this creature produces — the fall, the
  // gaps, the pass or the breach at the end — has been through a canvas that
  // refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 12;

  for (const role of ROLES) {
    it(`draws the wall and its breaks for ${role}`, () => {
      const { ctx } = fenceFrames(role, [4], TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("keeps the canvas happy with the way through against either wall", () => {
    for (const gaps of [[0], [CFG.cols - 1], [0, CFG.cols - 1]]) {
      const { ctx } = fenceFrames("p1", gaps, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    }
  });

  it("gives the two seats two different pictures of the same wall", () => {
    // Same world, same ticks, same body. The pilot's wall is broken and the
    // navigator's is not — two more ends to light and two uprights to draw, on
    // the one screen that can see them. That gap is the whole creature.
    const p1 = fenceFrames("p1", [4], TICKS);
    const p2 = fenceFrames("p2", [4], TICKS);
    expect(p1.ctx.calls).not.toBe(p2.ctx.calls);
  });

  it("shows the authored gaps to the pilot and the rig, and never to the navigator", () => {
    for (const role of ROLES) {
      const l = computeLayout(VIEWPORT, CFG, role);
      expect(showsFenceGaps(l), role).toBe(role !== "p2");
    }
  });

  it("draws a fence with no gaps at all without the canvas refusing a value", () => {
    // A solid fence — the shape a wave authors when the cannon is the only
    // answer. It is one unbroken run from wall to wall on both screens, which
    // is the one arrangement `drawFences` has no gate to interrupt it with.
    for (const role of ROLES) {
      const { ctx } = fenceFrames(role, [], TICKS);
      expect(ctx.calls, role).toBeGreaterThan(1000);
    }
  });
});
