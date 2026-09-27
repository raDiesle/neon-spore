import { afterEach, describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG, midCol, type SimConfig, type ThroatState } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { OUTLINE_DRIFT } from "../src/outline-drift.js";
import { throatRingCircle } from "../src/throat-grip.js";
import { rings } from "../src/throat-shape.js";
import { THROAT_SWAY } from "../src/throat-sway.js";

/**
 * THE THROAT's sway (`throat-sway.ts`): the middle of the gullet swings more
 * than half a tile, the root and the lowest ring do not move at all, and the
 * navigator's cinch is on the ring as it is drawn.
 */

const CFG: SimConfig = DEFAULT_CONFIG;
const L = computeLayout({ width: 900, height: 1600, dpr: 2 }, CFG, "p1");
const B: ThroatState = {
  kind: "throat",
  phase: "still",
  phaseBeat: 0,
  slack: 1,
  mouthFrom: midCol(CFG),
  chokedBeat: -1,
  fedBeat: -1,
  cinchBeat: -1,
  breath: 0,
  haulStep: 0,
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

  it("puts the cinch on the lowest ring as it is drawn", () => {
    for (const beat of [3, 17, 41]) {
      const low = rings(L, CFG, B, beat, 0.5)[CFG.throatRings - 1];
      const cinch = throatRingCircle(L, CFG, B, beat, 0.5);
      expect(cinch?.x).toBe(low?.x);
      expect(cinch?.y).toBe(low?.y);
    }
  });
});
