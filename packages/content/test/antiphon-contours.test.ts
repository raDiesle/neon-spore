import { describe, expect, it } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { ANTIPHON_CONTOURS, antiphonRadiusMul } from "../src/antiphon-contours.js";

/**
 * The table is the simulation's count, in the simulation's families, and
 * no two of a family are the same shape: a rail that closed in on a family
 * with two identical contours on it would be a question with no answer.
 */
describe("THE ANTIPHON's contours", () => {
  it("has one contour for every index the simulation can grow", () => {
    expect(ANTIPHON_CONTOURS.length).toBe(DEFAULT_CONFIG.antiphonShapes);
  });

  it("falls into the simulation's families, one draft each", () => {
    const size = DEFAULT_CONFIG.antiphonFamily;
    const drafts = new Set<string>();
    for (let f = 0; f * size < ANTIPHON_CONTOURS.length; f++) {
      const family = ANTIPHON_CONTOURS.slice(f * size, (f + 1) * size);
      const names = new Set(family.map((c) => c.family));
      expect(names.size).toBe(1);
      const [name] = names;
      expect(drafts.has(name ?? "")).toBe(false);
      drafts.add(name ?? "");
    }
  });

  it("never has two of a family that are the same shape, and every one is said differently", () => {
    const size = DEFAULT_CONFIG.antiphonFamily;
    for (let f = 0; f * size < ANTIPHON_CONTOURS.length; f++) {
      const family = ANTIPHON_CONTOURS.slice(f * size, (f + 1) * size);
      const shapes = new Set(
        family.map(({ family: _, said: __, ...rest }) => JSON.stringify(rest)),
      );
      expect(shapes.size).toBe(family.length);
      expect(new Set(family.map((c) => c.said)).size).toBe(family.length);
    }
  });

  it("is a radius at an angle, round off the table", () => {
    for (let i = 0; i < ANTIPHON_CONTOURS.length; i++) {
      let lo = Number.POSITIVE_INFINITY;
      let hi = 0;
      for (let k = 0; k < 40; k++) {
        const m = antiphonRadiusMul(i, (k / 40) * Math.PI * 2, 0.3);
        lo = Math.min(lo, m);
        hi = Math.max(hi, m);
      }
      expect(lo).toBeGreaterThan(0.3);
      expect(hi).toBeLessThan(2);
      expect(hi).toBeGreaterThan(lo);
    }
    expect(antiphonRadiusMul(-1, 1, 0)).toBe(1);
    expect(antiphonRadiusMul(99, 1, 0)).toBe(1);
  });
});
