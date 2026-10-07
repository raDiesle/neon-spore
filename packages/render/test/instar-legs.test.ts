import { describe, expect, it } from "bun:test";
import { type Leg, legRings, profileLegs } from "../src/instar-legs.js";
import type { Point } from "../src/instar-place.js";

const hipOf = (g: Leg | undefined): Point => g?.bones[0] as Point;
const toeOf = (g: Leg | undefined): Point => g?.bones.at(-1) as Point;

/** A level body running left to right, `r` thick, its belly underneath. */
function level(r: number, belly = 1): { spine: Point[]; bottom: Point[] } {
  const spine = Array.from({ length: 33 }, (_, i) => ({ x: 100 + i * 10, y: 300 }));
  return { spine, bottom: spine.map((p) => ({ x: p.x, y: p.y + belly * r * 0.8 })) };
}

describe("THE INSTAR's legs side-on", () => {
  it("are two pairs, far then near, a foreleg and a hind leg each", () => {
    const { spine, bottom } = level(40);
    const legs = profileLegs(spine, bottom, 40, 0);
    expect(legs.map((g) => g.far)).toEqual([true, true, false, false]);
    const [, , fore, hind] = legs;
    expect(hipOf(fore).x).toBeLessThan(hipOf(hind).x);
  });

  it("hang below the belly they leave, the far pair's hips higher on the body", () => {
    const r = 40;
    const { spine, bottom } = level(r);
    const legs = profileLegs(spine, bottom, r, 0);
    for (const g of legs) {
      expect(toeOf(g).y - hipOf(g).y).toBeGreaterThan(r * 0.9);
    }
    expect(hipOf(legs[0]).y).toBeLessThan(hipOf(legs[2]).y);
  });

  it("stand off the belly when it faces up, rather than through the body", () => {
    const r = 40;
    const { spine, bottom } = level(r, -1);
    for (const g of profileLegs(spine, bottom, r, 0)) {
      expect(toeOf(g).y).toBeLessThan(hipOf(g).y);
    }
  });

  it("are met by a bolt along their whole length, as thick as they are drawn", () => {
    const { spine, bottom } = level(40);
    const [leg] = profileLegs(spine, bottom, 40, 0);
    const rings = legRings(leg as Leg);
    expect(rings[0]?.c).toEqual(hipOf(leg));
    expect(rings.at(-1)?.c.x).toBeCloseTo(toeOf(leg).x, 3);
    expect(Math.min(...rings.map((q) => q.r))).toBeGreaterThan(0);
  });
});
