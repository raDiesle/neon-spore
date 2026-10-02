import { describe, expect, it } from "bun:test";
import {
  type GaugeState,
  gaugeGape,
  gaugeGapeSpan,
  gaugeSpanNow,
  step,
  type World,
} from "../src/index.js";
import { CFG, call, callable, heard, offBand, playing } from "./gauge-rig.js";

/**
 * **THE GAUGE's mouth opens, and a miss loses the round** (`src/gauge-gape.ts`).
 * The owner, 2 October 2026: *when hitted wrong, the wave is lost*, and later
 * the same day, for every boss: *a miss makes the boss wave fail and requires
 * retry*. Held to what the pair would notice: a level opens the mouth a step
 * and narrows the wound, and a miss ends the round lost and strikes the hull,
 * so the wave fails into its retry.
 */

/** One wrong shot, landed at once. */
function miss(world: World, g: GaugeState): void {
  callable(world, g);
  offBand(g);
  heard(world, 2, call(world));
}

describe("THE GAUGE's mouth", () => {
  it("opens a step on every level, and the wound narrows with it", () => {
    const { g } = playing();
    const shut = gaugeGapeSpan(CFG, g);
    expect(gaugeGape(g)).toBe(0);
    g.level = 1;
    expect(gaugeGape(g)).toBe(1);
    expect(gaugeGapeSpan(CFG, g)).toBe(shut - CFG.gaugeGapeSpanMilli);
    // The judgement asks the same width the picture draws.
    expect(gaugeSpanNow(CFG, g)).toBe(gaugeGapeSpan(CFG, g));
  });

  it("does not open on a miss: the miss loses the round, the hull struck", () => {
    const { world, g } = playing();
    miss(world, g);
    expect(g.misses).toBe(1);
    expect(gaugeGape(g)).toBe(0);
    step(world, []);
    expect(g.phase).toBe("verdict");
    expect(g.passed).toBe(false);
    expect(world.scars.length).toBe(1);
    expect(world.events.some((e) => e.type === "waveFailed")).toBe(true);
  });

  it("is never so narrow on the last level that the band is not there", () => {
    const { g } = playing();
    g.level = CFG.gaugeLevels - 1;
    expect(gaugeGapeSpan(CFG, g)).toBeGreaterThan(CFG.gaugeBoundSpanMilli);
  });
});
