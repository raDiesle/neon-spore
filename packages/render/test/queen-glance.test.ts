import { describe, expect, it } from "bun:test";
import { type Glance, glancedPoint, glanceFrame, glanceStill } from "../src/glance.js";
import { cock, GLANCE_ROUND, glanceOf, glanceRound, look, sway } from "../src/glance-styles.js";
import { QUEEN_GLANCE, QUEEN_GLANCE_HOLD, QUEEN_GLANCE_SIZE } from "../src/queen-glance.js";

/**
 * **THE BULB QUEEN's shell glances** (`queen-glance.ts`, `glance.ts`): it
 * ships still, each VERSUS answer swings her middle both ways far enough to be
 * seen, every round hands over level, and her crane arms' shoulders — the
 * points a turn holds — stay where they are.
 */

const RX = 100;
const at = { x: 0, y: 0, r: RX, hold: QUEEN_GLANCE_HOLD };
const sweep = (g: Glance) =>
  Array.from({ length: 121 }, (_, i) => (i * GLANCE_ROUND) / 120).map((t) => g.swing(t));

describe("THE BULB QUEEN's glance", () => {
  it("ships still, and a still frame draws her as before", () => {
    for (const t of [0, 0.7, 1.5, 4.5, 13]) {
      expect(glanceStill(glanceFrame(QUEEN_GLANCE, t, at))).toBe(true);
    }
  });

  it("each answer swings her middle both ways, a good share of her half-width", () => {
    // What VERSUS `queen:glance` offers: each style at her size.
    for (const style of [sway, look, cock]) {
      const s = sweep(glanceOf(style, QUEEN_GLANCE_SIZE));
      expect(Math.max(...s)).toBeGreaterThan(0.12);
      expect(Math.min(...s)).toBeLessThan(-0.12);
    }
  });

  it("every round starts and ends level at the middle", () => {
    for (const style of [sway, look, cock]) {
      for (const t of [0, GLANCE_ROUND - 1e-9]) {
        const p = glanceRound(style, t, QUEEN_GLANCE_SIZE);
        expect(Math.abs(p.swing)).toBeLessThan(1e-6);
        expect(Math.abs(p.roll)).toBeLessThan(1e-6);
      }
    }
  });

  it("holds the shoulders her arms hang from, and moves her middle", () => {
    const f = { ...at, swing: QUEEN_GLANCE_SIZE.reach * RX, roll: 0 };
    for (const side of [-1, 1]) {
      const p = { x: side * QUEEN_GLANCE_HOLD * RX, y: 5 };
      const q = glancedPoint(f, p);
      expect(q.x).toBeCloseTo(p.x, 6);
      expect(q.y).toBeCloseTo(p.y, 6);
    }
    expect(glancedPoint(f, { x: 0, y: 0 }).x).toBeCloseTo(QUEEN_GLANCE_SIZE.reach * RX, 6);
  });
});
