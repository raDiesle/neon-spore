import { describe, expect, test } from "bun:test";
import { CATALOGUE } from "../src/catalogue.js";
import { measure, ringClearance } from "../src/metrics.js";

/**
 * The ring is the only shape in the catalogue made of two loops, and the only
 * one that can destroy itself by being tuned: push the pupil out or grow it,
 * and it crosses the body's outer edge. Six parameters can do it and none of
 * them looks dangerous on its own.
 *
 * The floor is a fraction of the body's radius rather than a pixel count,
 * because the sheet fits every cell to its own box and the game derives the
 * real size from the tile — the only thing that travels between them is the
 * ratio.
 */
const FLOOR = 0.12;

const rings = CATALOGUE.filter((e) => e.subject.hole !== undefined);

describe("ring", () => {
  test("the catalogue has rings at all, so the rest of this file means something", () => {
    expect(rings.length).toBeGreaterThan(0);
  });

  test("a pupil never breaches the body it is cut from", () => {
    for (const entry of rings) {
      // Half the width is the body's radius; the clearance is measured in the
      // same units the points are in.
      const radius = measure(entry.subject).w / 2;
      const ratio = ringClearance(entry.subject) / radius;
      expect({ name: entry.subject.name, thin: ratio < FLOOR }).toEqual({
        name: entry.subject.name,
        thin: false,
      });
    }
  });

  test("a ring encloses its material, not its opening", () => {
    for (const entry of rings) {
      const m = measure(entry.subject);
      // A disc of this width would be πr²; a ring must come out well under it
      // or the hole is not being subtracted at all.
      const disc = Math.PI * (m.w / 2) ** 2;
      expect({ name: entry.subject.name, solid: m.area > disc * 0.8 }).toEqual({
        name: entry.subject.name,
        solid: false,
      });
    }
  });
});
