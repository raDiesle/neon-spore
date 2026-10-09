import { describe, expect, it, setDefaultTimeout } from "bun:test";
import type { LampreyState, SimEvent } from "@neon-spore/sim";
import { LampreyAnger } from "../src/lamprey-anger.js";
import { lampreyPose } from "../src/lamprey-pose.js";
import { lampreyTowPoint } from "../src/lamprey-tow-grip.js";
import { computeLayout } from "../src/layout.js";
import { CFG, FRAME_TIMEOUT_MS } from "./frame-harness.js";
import { PULL, posed, stood } from "./lamprey-harness.js";

/**
 * A tow's lunge on the screen (`render/lamprey-anger.ts`): the simulation
 * throws the head from two thirds of its curve back to a third in one tick,
 * and the picture carries it there — down past where it lands, at the hull,
 * and back, shaking — then leaves the pose exactly where the simulation put
 * it. Set off from the simulation's own point, never a frame painted before.
 */

setDefaultTimeout(FRAME_TIMEOUT_MS);

const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p2");
const ANGER: SimEvent = { type: "lampreyAnger", side: 1, col: 3 };

/** A tow on, its head thrown back to a third: the instant after the lunge in the simulation. */
function thrown(): LampreyState {
  return posed(stood(), "bite", { ...PULL, ask: "tow", holder: 1 }, (s) => {
    s.towSide = -1;
    s.towMilli = CFG.lampreyTowBackMilli;
    s.angered = true;
  });
}

const noBurst = () => {};

describe("THE LAMPREY's lunge", () => {
  it("leaves the pose alone with no lunge thrown", () => {
    const s = thrown();
    const p = lampreyPose(L, CFG, s, 10, 0);
    expect(new LampreyAnger().apply(p, L, CFG, s, 0)).toEqual(p);
  });

  it("sets off from two thirds along the curve, plunges past where it lands toward the hull, and comes back", () => {
    const s = thrown();
    const p = lampreyPose(L, CFG, s, 10, 0);
    const fit = new LampreyAnger();
    fit.ingest([ANGER], null, noBurst);
    const from = lampreyTowPoint(L, CFG, s, CFG.lampreyTowAngerMilli);
    // `time` 0 is a still point of the shake, so only the lunge moves it.
    expect(fit.apply(p, L, CFG, s, 0).y).toBeCloseTo(from.y, 0);
    expect(from.y).toBeLessThan(p.y);
    fit.update(0.3);
    const deepest = fit.apply(p, L, CFG, s, 0);
    expect(deepest.y).toBeGreaterThan(p.y + L.tile * 0.5);
    fit.update(5);
    expect(fit.now).toBe(0);
    expect(fit.apply(p, L, CFG, s, 0)).toEqual(p);
  });

  it("is forgotten on a clear, and shakes nothing once the tow is over", () => {
    const s = thrown();
    const p = lampreyPose(L, CFG, s, 10, 0);
    const fit = new LampreyAnger();
    fit.ingest([ANGER], null, noBurst);
    s.phase = "leap";
    expect(fit.apply(p, L, CFG, s, 0.1)).toEqual(p);
    fit.clear();
    expect(fit.now).toBe(0);
  });
});
