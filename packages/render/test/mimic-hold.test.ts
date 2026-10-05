import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { computeLayout } from "../src/layout.js";
import { BAND, mimicFrames, mimicHold } from "../src/mimic-frame-look.js";
import { mimicFuseRest } from "../src/mimic-fuse.js";
import { mimicPose } from "../src/mimic-pose.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, VIEWPORT } from "./frame-harness.js";
import { CORE, posed, SIGN, SPLIT, stood } from "./mimic-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * **THE MIMIC holds its frame, and counts its window on THE SLOW's fuse**
 * (`mimic-frame-look.ts`, `mimic-pose.ts`, `mimic-fuse.ts`; the owner, 5
 * October 2026): one frame round the picture, two on a split, the same on
 * both screens; the crane hung over it; and a fuse that starts whole and
 * burns with the step's own beats, with no slow open.
 */

beforeAll(installCanvasGlobals);

const L = computeLayout(VIEWPORT, CFG, "p1");

describe("THE MIMIC's frame", () => {
  it("stands one frame round the picture and two on a split, the hold round all of them", () => {
    const world = stood();
    const one = mimicFrames(L, CFG, posed(world, "sign", SIGN));
    expect(one).toHaveLength(1);
    const two = mimicFrames(L, CFG, posed(world, "sign", SPLIT));
    expect(two.map((f) => f.seat)).toEqual([1, 2]);
    const hold = mimicHold(L, two);
    const band = BAND * L.tile;
    expect(hold?.left).toBeCloseTo(Math.min(...two.map((f) => f.left)) - band);
    expect(hold?.right).toBeCloseTo(Math.max(...two.map((f) => f.right)) + band);
    expect(mimicHold(L, [])).toBeNull();
  });

  it("is the same box on both screens' fields", () => {
    const world = stood();
    const s = posed(world, "sign", SIGN);
    const p2 = computeLayout(VIEWPORT, CFG, "p2");
    const [a] = mimicFrames(L, CFG, s);
    const [b] = mimicFrames(p2, CFG, s);
    expect(b?.right ?? 0).toBeCloseTo((a?.right ?? 0) - L.gridLeft + p2.gridLeft);
    expect(b?.top ?? 0).toBeCloseTo((a?.top ?? 0) - L.gridTop + p2.gridTop);
  });

  it("hangs the crane over the frame it holds, clear of its top", () => {
    const world = stood();
    const s = posed(world, "sign", SIGN);
    const p = mimicPose(L, CFG, s, world.beat, 0);
    const hold = mimicHold(L, mimicFrames(L, CFG, s));
    expect(p.held).toBe(1);
    expect(p.y + p.r * p.squash).toBeLessThan(hold?.top ?? 0);
  });
});

describe("THE MIMIC's fuse", () => {
  it("burns down the picture's window and the core's, from whole", () => {
    const world = stood();
    const s = posed(world, "sign", SIGN);
    // Posed a beat in, of ten.
    expect(mimicFuseRest(s, world.beat, 0)).toBeCloseTo(0.9);
    expect(mimicFuseRest(s, world.beat + 4, 0)).toBeCloseTo(0.5);
    expect(mimicFuseRest(s, world.beat + 20, 0)).toBe(0);
    const core = posed(world, "core", CORE);
    expect(mimicFuseRest(core, world.beat, 0)).toBeCloseTo(0.75);
  });

  it("counts nothing between asks", () => {
    const world = stood();
    for (const phase of ["entering", "mimicking", "peeled", "rolling", "clench"] as const) {
      expect(mimicFuseRest(posed(world, phase, SIGN), world.beat, 0), phase).toBe(0);
    }
  });
});
