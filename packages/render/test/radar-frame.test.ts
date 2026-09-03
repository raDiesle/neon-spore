import { beforeAll, describe, expect, it } from "bun:test";
import { createWorld, type SpawnEntry } from "@neon-spore/sim";
import { drawRadar } from "../src/field.js";
import { computeLayout, type ViewRole } from "../src/layout.js";
import { CFG, installCanvasGlobals, stubCanvas } from "./frame-harness.js";

/**
 * Radar ownership crosses the controls: p1 reads rocks, p2 reads the living.
 * A single queued body must draw on one strip and nowhere on the other.
 */

beforeAll(installCanvasGlobals);

describe("the radar", () => {
  const layout = (role: ViewRole) => computeLayout({ width: 900, height: 1600, dpr: 1 }, CFG, role);

  function strips(queue: SpawnEntry[]) {
    const world = createWorld(CFG, 1, queue);
    const p1 = stubCanvas();
    drawRadar(p1.ctx as unknown as CanvasRenderingContext2D, layout("p1"), world);
    const p2 = stubCanvas();
    drawRadar(p2.ctx as unknown as CanvasRenderingContext2D, layout("p2"), world);
    return { p1: p1.ctx, p2: p2.ctx };
  }

  it("shows a rock's arrival to p1 only, never to p2", () => {
    const { p1, p2 } = strips([{ beat: 2, col: 3, kind: "meteor", color: null }]);
    expect(p1.calls).toBeGreaterThan(0);
    expect(p2.calls).toBe(0);
  });

  it("shows a living arrival to p2 only, never to p1", () => {
    const { p1, p2 } = strips([{ beat: 2, col: 3, kind: "slick", color: "red" }]);
    expect(p1.calls).toBe(0);
    expect(p2.calls).toBeGreaterThan(0);
  });

  /**
   * A lure arrives on player 2's strip carrying the exclamation and its name;
   * on player 1's it carries nothing, because player 1's strip carries `guard`
   * kinds only. That is the same rule the test above checks for a slick — the
   * point here is that the alarm rides on it rather than around it.
   */
  it("marks a lure on p2's strip and leaves p1's as blank as a slick's", () => {
    const lure = strips([{ beat: 2, col: 3, kind: "lure", color: "cyan", wears: "bulb" }]);
    expect(lure.p1.calls).toBe(0);

    // More than the plain blip a real bulb draws: the glyph and the word.
    const bulb = strips([{ beat: 2, col: 3, kind: "bulb", color: "cyan" }]);
    expect(lure.p2.calls).toBeGreaterThan(bulb.p2.calls);
  });
});
