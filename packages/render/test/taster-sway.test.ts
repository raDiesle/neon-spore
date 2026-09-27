import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, type SimConfig } from "@neon-spore/sim";
import { TASTER_SWAY, tasterSway } from "../src/taster-sway.js";

/**
 * THE TASTER's sway (`taster-sway.ts`): a tip swings by more than half a tile
 * each way and never past its cap, neighbours never far enough apart to
 * cross, the gust reaches one end of the fan after the other, and the fan is
 * still once it is closed or out.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const BLADES = 11;

/** Blade `i`'s swing at every quarter beat of 240, in tiles. */
function swung(i: number, phase: "fanning" | "closed" | "out" = "fanning"): number[] {
  const out: number[] = [];
  for (let quarter = 0; quarter < 4 * 240; quarter++) {
    out.push(tasterSway(CFG, phase, i, Math.floor(quarter / 4), (quarter % 4) / 4));
  }
  return out;
}

describe("THE TASTER's fan sways like a field of wheat", () => {
  it("swings a tip by more than half a tile each way, and never past its cap", () => {
    for (const i of [0, 5, 10]) {
      const s = swung(i);
      expect(Math.max(...s)).toBeGreaterThan(0.5);
      expect(Math.min(...s)).toBeLessThan(-0.5);
      expect(Math.max(...s.map(Math.abs))).toBeLessThanOrEqual(TASTER_SWAY);
    }
  });

  it("never swings two neighbours a fifth of a tile apart, so no two blades cross", () => {
    for (let i = 0; i + 1 < BLADES; i++) {
      const a = swung(i);
      const b = swung(i + 1);
      expect(Math.max(...a.map((v, q) => Math.abs(v - (b[q] ?? 0))))).toBeLessThan(0.2);
    }
  });

  it("does not swing both ends of the fan in step", () => {
    const a = swung(0);
    const b = swung(BLADES - 1);
    expect(Math.max(...a.map((v, q) => Math.abs(v - (b[q] ?? 0))))).toBeGreaterThan(0.3);
  });

  it("is still once the fan is closed, and once it is out", () => {
    expect(Math.max(...swung(3, "closed").map(Math.abs))).toBe(0);
    expect(Math.max(...swung(3, "out").map(Math.abs))).toBe(0);
  });
});
