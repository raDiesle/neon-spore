import { describe, expect, it } from "bun:test";
import { PLATE_ENDS, plateForm, seeFrontBody } from "../src/instar-front-body.js";
import type { Look } from "../src/instar-plate.js";

/**
 * **THE INSTAR's face-on body is scaled all over** (`instar-front-body.ts`):
 * each plate's scales are laid in a box round every ring of its stretch of
 * tube, and the plates reach from the neck to the far end. The owner,
 * 7 October 2026: *when its getting bigger to fly there are small rectangle
 * skin textures visible in the center of the body* — the box was as tall as
 * two rings' centres are apart, a sliver once the body runs back into depth.
 */
describe("THE INSTAR's scales face-on", () => {
  const neck = { x: 0, y: 0 };
  // Going straight back and up behind the head, the way it comes in.
  const seen = seeFrontBody({ r: 40, time: 0 } as Look, neck, { x: 30, y: -160 }, 0.55);
  const every = Math.min(...PLATE_ENDS);

  it("lays every plate over every ring of its stretch, end-on too", () => {
    for (const i of PLATE_ENDS) {
      const f = plateForm(seen, i);
      for (const g of seen.slice(i - every, i + 1)) {
        expect(g.c.x - g.r).toBeGreaterThanOrEqual(f.x - f.r - 1e-6);
        expect(g.c.x + g.r).toBeLessThanOrEqual(f.x + f.r + 1e-6);
        expect(g.c.y - g.r).toBeGreaterThanOrEqual(f.y - (f.ry ?? f.r) - 1e-6);
        expect(g.c.y + g.r).toBeLessThanOrEqual(f.y + (f.ry ?? f.r) + 1e-6);
      }
      // Never the sliver it was: as tall as the plate's own nearest ring is round.
      expect((f.ry ?? f.r) * 2).toBeGreaterThanOrEqual((seen[i] as { r: number }).r * 2 - 1e-6);
    }
  });

  it("covers the body from the neck to its far end, the far plate drawn first", () => {
    expect(PLATE_ENDS[0]).toBe(seen.length - 1);
    expect(every * PLATE_ENDS.length).toBe(seen.length - 1);
  });
});
