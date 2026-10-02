import { describe, expect, it } from "bun:test";
import {
  type GaugeState,
  gaugeGape,
  gaugeGapeSpan,
  gaugeJammed,
  gaugeSpanNow,
  gaugeSwallowed,
  step,
  type World,
} from "../src/index.js";
import { CFG, call, callable, heard, offBand, playing, TPB } from "./gauge-rig.js";

/**
 * **THE GAUGE's mouth opens** (`src/gauge-gape.ts`). The owner, 2 October
 * 2026: *when hitted wrong, the wave is lost*. A miss jammed the valve, and a
 * pair who did not know the needle could be swung by hand ran the clock out.
 * Held to what the pair would notice: a miss leaves the valve answering and
 * the wound narrower, a level opens the mouth the same step, and a mouth open
 * all the way loses the round and strikes the hull.
 */

/** One wrong shot, landed at once. */
function miss(world: World, g: GaugeState): void {
  callable(world, g);
  offBand(g);
  heard(world, 2, call(world));
}

describe("THE GAUGE's mouth", () => {
  it("opens a step on a miss, and the valve still answers", () => {
    const { world, g } = playing();
    const shut = gaugeGapeSpan(CFG, g);
    expect(gaugeGape(g)).toBe(0);
    miss(world, g);
    expect(g.misses).toBe(1);
    expect(gaugeGape(g)).toBe(1);
    expect(gaugeJammed(g)).toBe(false);
    expect(gaugeGapeSpan(CFG, g)).toBe(shut - CFG.gaugeGapeSpanMilli);
    // The judgement asks the same width the picture draws.
    expect(gaugeSpanNow(CFG, g)).toBe(gaugeGapeSpan(CFG, g));
    heard(world, 1, { kind: "valve", on: true, dir: g.needleMilli > 500 ? -1 : 1 });
    const was = g.needleMilli;
    for (let i = 0; i < TPB; i++) step(world, []);
    expect(g.needleMilli).not.toBe(was);
  });

  it("opens a step on every level, so the last one forgives fewer misses", () => {
    const { g } = playing();
    g.level = CFG.gaugeLevels - 1;
    expect(gaugeGape(g)).toBe(CFG.gaugeLevels - 1);
    g.misses = CFG.gaugeGapeFull - CFG.gaugeLevels;
    expect(gaugeSwallowed(CFG, g)).toBe(false);
    g.misses += 1;
    expect(gaugeSwallowed(CFG, g)).toBe(true);
  });

  it("swallows the ship when it is open all the way: the round lost, the hull struck", () => {
    const { world, g } = playing();
    for (let i = 0; i < CFG.gaugeGapeFull - 1; i++) miss(world, g);
    step(world, []);
    expect(g.phase).toBe("play");
    expect(world.scars.length).toBe(0);
    miss(world, g);
    step(world, []);
    expect(g.phase).toBe("verdict");
    expect(g.passed).toBe(false);
    expect(world.scars.length).toBe(1);
  });

  it("is never so narrow before it swallows that the band is not there", () => {
    const { g } = playing();
    g.misses = CFG.gaugeGapeFull - 1;
    expect(gaugeGapeSpan(CFG, g)).toBeGreaterThan(CFG.gaugeBoundSpanMilli);
  });
});
