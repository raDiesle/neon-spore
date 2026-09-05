import { beforeAll, describe, expect, it } from "bun:test";
import { controlSet } from "@neon-spore/content";
import { createWorld, type SpawnEntry, ticksPerBeat } from "@neon-spore/sim";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { showsVeerArrow } from "../src/veer-marks.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, VIEWPORT } from "./frame-harness.js";

/**
 * THE VEER, drawn: the rider both seats see, and the arrow only the pilot has.
 *
 * Nothing here can answer whether the clown *reads* as a clown at thirty
 * pixels — that is the check this lane owes and it needs an eye. What it can
 * hold is the shape of the arrangement: that a rock which changes column
 * mid-fall never hands the canvas a coordinate it refuses, that the side is
 * drawn on one seat and not the other, and that one standing against either
 * wall still puts its marks somewhere a canvas will take.
 */

beforeAll(installCanvasGlobals);

function veerFrames(role: ViewRole, col: number, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "veer", color: null }];
  // Every second tick: the brace that says *now* lives inside one beat and is
  // gone by the end of it, so a sampling that only caught beat boundaries
  // would never draw the rider crouched at all.
  return runFrames(createWorld(CFG, 1, queue), role, ticks, {
    every: 2,
    controls: controlSet("default"),
  });
}

describe("the veer", () => {
  // Past the hull, so every frame this creature produces — the fall, the three
  // changes of lane, the crouch before each one and the breach at the end —
  // has been through a canvas that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 18;

  for (const role of ROLES) {
    it(`draws the rock, its rider and its marks for ${role}`, () => {
      const { ctx } = veerFrames(role, 3, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("keeps the canvas happy against either wall", () => {
    for (const col of [0, CFG.cols - 1]) {
      const { ctx } = veerFrames("p1", col, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    }
  });

  it("gives the two seats two different pictures of the same rock", () => {
    // Same world, same ticks, same body. The pilot gets one arrow; the
    // navigator gets two dim ones and a target lock, which is more marks and
    // less information. That gap is the whole creature.
    const p1 = veerFrames("p1", 3, TICKS);
    const p2 = veerFrames("p2", 3, TICKS);
    expect(p1.ctx.calls).not.toBe(p2.ctx.calls);
  });

  it("puts the side on the pilot's screen and on no other", () => {
    const layout = (role: ViewRole) => computeLayout(VIEWPORT, CFG, role);
    expect(showsVeerArrow(layout("p1"))).toBe(true);
    expect(showsVeerArrow(layout("p2"))).toBe(false);
    // The rig is both seats at once, so it carries everything either has.
    expect(showsVeerArrow(layout("test"))).toBe(true);
  });
});
