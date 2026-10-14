import { describe, expect, it } from "bun:test";
import type { LampreyState } from "@neon-spore/sim";
import { lampreyGlanceHush } from "../src/lamprey-glance.js";

/**
 * **THE LAMPREY's head steadies while it bites** (`lamprey-glance.ts`): the
 * lit tooth a thumb taps is judged off the pose with no clock, so the turn is
 * gone by the bite's second beat and back by the second beat after it.
 */
const at = (phase: LampreyState["phase"], phaseBeat: number) =>
  ({ phase, phaseBeat }) as LampreyState;

describe("THE LAMPREY's glance hush", () => {
  it("is gone a beat into a bite, and stays gone", () => {
    expect(lampreyGlanceHush(at("bite", 10), 10)).toBe(1);
    expect(lampreyGlanceHush(at("bite", 10), 10.5)).toBeCloseTo(0.5, 6);
    for (const t of [11, 14, 40]) expect(lampreyGlanceHush(at("bite", 10), t)).toBe(0);
  });

  it("comes back over the first beat of anything else", () => {
    expect(lampreyGlanceHush(at("leap", 20), 20)).toBe(0);
    expect(lampreyGlanceHush(at("leap", 20), 20.25)).toBeCloseTo(0.25, 6);
    expect(lampreyGlanceHush(at("rearing", 20), 23)).toBe(1);
  });
});
