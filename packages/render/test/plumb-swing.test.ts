import { describe, expect, it } from "bun:test";
import { PLUMB_SETTLES_PER_WEIGHT, plumbBoss } from "@neon-spore/sim";
import { LOOSE, plumbSwing } from "../src/plumb-pose.js";
import { stood } from "./plumb-harness.js";

/**
 * THE PLUMB's loose stones (`plumbSwing`): on the beat clock, a loose stone
 * travels more than half a tile each way on its 1.25-tile chain, and a locked
 * one hangs still.
 */

const CHAIN = 1.25;
const QUARTERS = Array.from({ length: 4 * 120 }, (_, q) => q);

describe("THE PLUMB's loose stones swing on the beat", () => {
  it("carries a loose stone more than half a tile each way, and never past its range", () => {
    const world = stood();
    const s = plumbBoss(world);
    if (s === null) throw new Error("the plumb wave stood no plumb");
    s.weights = [0, 0];
    s.pullMilli = [0, 0];
    const x = QUARTERS.map(
      (q) => CHAIN * Math.sin(plumbSwing(s, world, 0, world.beat + Math.floor(q / 4), (q % 4) / 4)),
    );
    expect(Math.max(...x)).toBeGreaterThan(0.5);
    expect(Math.min(...x)).toBeLessThan(-0.5);
    expect(Math.max(...x.map(Math.abs))).toBeLessThanOrEqual(CHAIN * Math.sin(LOOSE) + 1e-9);
  });

  it("hangs a locked stone still", () => {
    const world = stood();
    const s = plumbBoss(world);
    if (s === null) throw new Error("the plumb wave stood no plumb");
    s.weights = [PLUMB_SETTLES_PER_WEIGHT, 0];
    s.pullMilli = [0, 0];
    const swings = QUARTERS.map((q) =>
      plumbSwing(s, world, 0, world.beat + Math.floor(q / 4), (q % 4) / 4),
    );
    expect(Math.max(...swings.map(Math.abs))).toBe(0);
  });
});
