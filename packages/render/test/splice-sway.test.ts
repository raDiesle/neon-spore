import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { SPLICE_LIFT, SPLICE_REAR, spliceSway } from "../src/splice-sway.js";

/**
 * THE SPLICE's eater (`splice-sway.ts`): the head lifts by more than half a
 * tile and never drops below its hang, the back end swings by more than half
 * a tile each way, and both go when the eater is not calm, the back end too
 * as its sac swells.
 */

const CFG = DEFAULT_CONFIG;
const QUARTERS = Array.from({ length: 4 * 240 }, (_, q) => q / 4);

describe("THE SPLICE's eater rears its head and swings its back end", () => {
  it("lifts the head by more than half a tile, only ever up", () => {
    const lift = QUARTERS.map((b) => spliceSway(CFG, b, 1, 0).lift);
    expect(Math.max(...lift)).toBeGreaterThan(0.5);
    expect(Math.min(...lift)).toBeGreaterThanOrEqual(0);
    expect(Math.max(...lift)).toBeLessThanOrEqual(SPLICE_LIFT);
  });

  it("swings the back end by more than half a tile each way", () => {
    const rear = QUARTERS.map((b) => spliceSway(CFG, b, 1, 0).rear);
    expect(Math.max(...rear)).toBeGreaterThan(0.5);
    expect(Math.min(...rear)).toBeLessThan(-0.5);
    expect(Math.max(...rear.map(Math.abs))).toBeLessThanOrEqual(SPLICE_REAR);
  });

  it("is still when not calm, and the back end as its sac swells", () => {
    const off = QUARTERS.map((b) => spliceSway(CFG, b, 0, 0));
    expect(Math.max(...off.map((s) => Math.abs(s.lift) + Math.abs(s.rear)))).toBe(0);
    const full = QUARTERS.map((b) => spliceSway(CFG, b, 1, 1).rear);
    expect(Math.max(...full.map(Math.abs))).toBe(0);
  });
});
