import { afterEach, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, hullRow, midCol, type SimConfig, type ThroatState } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { OUTLINE_DRIFT } from "../src/outline-drift.js";
import { throatAimCircle } from "../src/throat-grip.js";
import { rings } from "../src/throat-shape.js";
import { THROAT_SWAY } from "../src/throat-sway.js";

/**
 * THE THROAT's sway (`throat-sway.ts`): the middle of the gullet swings more
 * than half a tile, the root and the ring under the mouth do not move at all,
 * so the gullet stays joined to the mouth the navigator carries.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
const B: ThroatState = {
  kind: "throat",
  phase: "sucks",
  phaseBeat: 0,
  slack: 1,
  fedBeat: -1,
  refusedTick: -1,
  refusedId: -1,
  aimXMilli: midCol(CFG) * 1000,
  aimYMilli: (hullRow(CFG) - 3) * 1000,
  aimFromXMilli: -1,
  aimFromYMilli: -1,
  mode: "red",
  pumpDir: 0,
  pumpFromYMilli: 0,
  pumpMilli: 0,
};

const saved = OUTLINE_DRIFT.throat;
afterEach(() => {
  OUTLINE_DRIFT.throat = saved;
});

/** How far each ring stands from where it would with no sway, in tiles, at every quarter beat of 240. */
function swung(): number[][] {
  const out: number[][] = [];
  for (let quarter = 0; quarter < 4 * 240; quarter++) {
    const beat = Math.floor(quarter / 4);
    const phase = (quarter % 4) / 4;
    OUTLINE_DRIFT.throat = 0;
    const rest = rings(L, CFG, B, beat, phase);
    OUTLINE_DRIFT.throat = 1;
    const drawn = rings(L, CFG, B, beat, phase);
    out.push(drawn.map((r, i) => Math.abs(r.x - (rest[i]?.x ?? r.x)) / L.tile));
  }
  return out;
}

describe("THE THROAT sways where it hangs free", () => {
  it("swings its middle ring by more than half a tile, and no ring past its cap", () => {
    const all = swung();
    const middle = Math.floor(CFG.throatRings / 2);
    expect(Math.max(...all.map((s) => s[middle] ?? 0))).toBeGreaterThan(0.5);
    expect(Math.max(...all.flat())).toBeLessThanOrEqual(THROAT_SWAY.bow + THROAT_SWAY.snake);
  });

  it("holds the root and the ring over the mouth where they stand", () => {
    for (const s of swung()) {
      expect(s[0]).toBeLessThan(1e-9);
      expect(s[CFG.throatRings - 1]).toBeLessThan(1e-9);
    }
  });

  it("keeps the top ring under the mouth as it is drawn", () => {
    for (const beat of [3, 17, 41]) {
      const top = rings(L, CFG, B, beat, 0.5)[CFG.throatRings - 1];
      const mouth = throatAimCircle(L, CFG, B);
      expect(top?.x).toBeCloseTo(mouth.x, 6);
      expect(top?.y ?? 0).toBeGreaterThan(mouth.y);
    }
  });
});
