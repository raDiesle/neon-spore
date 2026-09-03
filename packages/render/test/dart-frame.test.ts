import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry, ticksPerBeat } from "@neon-spore/sim";
import { drawRadar } from "../src/field.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, ROLES, runFrames, stubCanvas } from "./frame-harness.js";

/**
 * THE DART, drawn: the lean and the jet both seats see, the arrow and its legs
 * only player 2, and the two-way arrows and the question mark only player 1.
 *
 * Nothing here can answer whether the lean *reads* as a body about to move —
 * that is the check this lane owes and it needs an eye. What it can hold is
 * the shape of the arrangement: that a body which changes column mid-beat
 * never hands the canvas a coordinate it refuses, that the arrow is drawn on
 * one seat and not the other, and that a dart standing against either edge of
 * the field still puts its mark somewhere a canvas will take.
 */

beforeAll(installCanvasGlobals);

function dartFrames(role: ViewRole, col: number, ticks: number) {
  const queue: SpawnEntry[] = [{ beat: 0, col, kind: "dart", color: "red" }];
  // Every second tick rather than every fourth: the whole of this creature
  // happens *between* beats — the jet is hottest in the first fraction of a
  // run and gone by the end of it — so a sampling that only caught beat
  // boundaries would never draw a plume at all.
  return runFrames(createWorld(CFG, 1, queue), role, ticks, { every: 2 });
}

describe("the dart", () => {
  // Past the hull, so every frame this creature produces — the hang, the run,
  // the jet, the arrow and the breach at the end — has been through a canvas
  // that refuses what a real one refuses.
  const TICKS = ticksPerBeat(CFG) * 20;

  for (const role of ROLES) {
    it(`draws the body, its jet and its diagonal for ${role}`, () => {
      const { ctx } = dartFrames(role, 3, TICKS);
      expect(ctx.calls).toBeGreaterThan(1000);
    });
  }

  it("gives the two seats two different pictures of the same body", () => {
    // Same world, same ticks, same body. Player 2 gets the arrow, the legs and
    // the placeholder; player 1 gets two arrows and a question mark, which is
    // more marks and far less picture. That gap is the whole creature.
    // Which mark lands on which screen is `dart-query.test.ts`'s to hold.
    const p1 = dartFrames("p1", 3, TICKS);
    const p2 = dartFrames("p2", 3, TICKS);
    expect(p2.ctx.calls).toBeGreaterThan(p1.ctx.calls);
  });

  it("keeps its arrow on the canvas in the first column and the last", () => {
    for (const col of [0, CFG.cols - 1]) {
      expect(() => dartFrames("p2", col, TICKS)).not.toThrow();
    }
  });

  it("announces a dart to player 1's strip and never to player 2's", () => {
    // The clasp's rule with a second body under it: the seat shown where it
    // is going is not the seat that can shoot it.
    const queue: SpawnEntry[] = [{ beat: 2, col: 3, kind: "dart", color: "cyan" }];
    const world = createWorld(CFG, 1, queue);
    const layout = (role: ViewRole) =>
      computeLayout({ width: 900, height: 1600, dpr: 1 }, CFG, role);

    const p1 = stubCanvas();
    drawRadar(p1.ctx as unknown as CanvasRenderingContext2D, layout("p1"), world);
    const p2 = stubCanvas();
    drawRadar(p2.ctx as unknown as CanvasRenderingContext2D, layout("p2"), world);

    expect(p1.ctx.calls).toBeGreaterThan(0);
    expect(p2.ctx.calls).toBe(0);
  });
});
