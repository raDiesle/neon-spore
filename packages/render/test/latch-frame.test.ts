import { beforeAll, describe, expect, it, setDefaultTimeout } from "bun:test";
import { latchPose } from "../src/latch-pose.js";
import { latchBodies, latchGripY, latchKnotY } from "../src/latch-shape.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { CFG, FRAME_TIMEOUT_MS, installCanvasGlobals, ROLES, VIEWPORT } from "./frame-harness.js";
import { count, frame, posed, stood } from "./latch-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * THE LATCH, drawn (`render/src/latch-draw.ts`): the colony in its one skin,
 * the tendril down the middle with its knots, the coil on the hull and the
 * two grips — on all three screens, set rather than played to;
 * `sim/test/latch.test.ts` proves the rules.
 */

beforeAll(() => {
  installCanvasGlobals();
  for (const role of ROLES) frame(role, () => {});
});

describe("THE LATCH's body", () => {
  it.each(ROLES)("draws the colony, the tendril and the next knot, on %s", (role) => {
    const drawn = frame(role, (w) => posed(w));
    expect(count(drawn, PALETTE.latchSkin)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.latchSkinDark)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.latchTendril)).toBeGreaterThan(0);
    expect(count(drawn, PALETTE.latchKnot)).toBeGreaterThan(0);
  });

  it("tears a body off the colony for every knot pulled in", () => {
    const world = stood();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const s = posed(world);
    const p = latchPose(s, CFG, world.beat, 0);
    const whole = latchBodies(l, CFG, s, p, 0).length;
    s.knots = 2;
    expect(latchBodies(l, CFG, s, p, 0).length).toBe(whole - 2);
    // The core, which holds the tendril, is never torn off.
    s.knots = 6;
    expect(latchBodies(l, CFG, s, p, 0).map((b) => b.knot)).toEqual([0]);
  });

  it("brings a knot down past the grips the instant its rope is hauled", () => {
    const world = stood();
    const l = computeLayout(VIEWPORT, CFG, "test");
    const s = posed(world);
    expect(latchKnotY(l, CFG, s, 1)).toBeLessThan(latchGripY(l, CFG));
    s.hauledMilli = CFG.latchKnotMilli;
    expect(latchKnotY(l, CFG, s, 1)).toBe(latchGripY(l, CFG));
  });

  it("stretches toward the ship as the rope is hauled, and rears up before a yank", () => {
    const world = stood();
    const s = posed(world);
    const slack = latchPose(s, CFG, world.beat, 0);
    s.hauledMilli = CFG.latchKnotMilli / 2;
    expect(latchPose(s, CFG, world.beat, 0).sag).toBeGreaterThan(slack.sag);
    s.yankBeat = world.beat + 1;
    expect(latchPose(s, CFG, world.beat, 0.5).rear).toBeGreaterThan(0);
  });
});

describe("THE LATCH's grips", () => {
  it("lays the puller's channel on the puller's own screen alone", () => {
    const p1 = frame("p1", (w) => posed(w));
    const p2 = frame("p2", (w) => posed(w));
    expect(count(p1, PALETTE.hullRim)).toBeGreaterThan(count(p2, PALETTE.hullRim));
  });

  it.each(ROLES)("takes the grips away once the colony is torn loose, on %s", (role) => {
    const hanging = frame(role, (w) => posed(w));
    const gone = frame(role, (w) => posed(w, "spent"));
    expect(count(gone, PALETTE.dim) + count(gone, PALETTE.hullRim)).toBeLessThan(
      count(hanging, PALETTE.dim) + count(hanging, PALETTE.hullRim),
    );
  });
});
