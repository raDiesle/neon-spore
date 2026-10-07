import { describe, expect, it } from "bun:test";
import { frontLimbs } from "../src/instar-front.js";
import { frontBody } from "../src/instar-front-body.js";
import type { Point } from "../src/instar-place.js";
import type { Look } from "../src/instar-plate.js";
import { place } from "../src/instar-profile-surface.js";

/**
 * **THE INSTAR is one drake from either side** (`instar-front.ts`,
 * `instar-front-body.ts`). The owner, 7 October 2026: *from any angle view,
 * it's identified to be the same drake — e.g. the tail looks different from
 * front perspective and side*. Face-on it has the side view's tail and legs,
 * and its tube wears the side view's hide, placed round its own rings.
 */
describe("THE INSTAR face-on is the drake side-on", () => {
  const r = 40;
  const look = { r, time: 0.7 } as Look;
  const neck = { x: 0, y: 0 };
  const body = frontBody(look, neck, { x: 60, y: -170 }, 0.55);

  it("puts the scales, the belly and the spines round its own rings, end to end", () => {
    body.seen.forEach((ring, i) => {
      for (const a of [0, 0.45, 1.2, 2.3, Math.PI]) {
        // Within the lens's swell of the near side.
        const p = place(body, i, a);
        expect(Math.hypot(p.x - ring.c.x, p.y - ring.c.y)).toBeLessThanOrEqual(ring.r * 1.02);
      }
    });
  });

  it("hangs four legs and carries the tail on out of the far end", () => {
    const limbs = frontLimbs(look, neck, body.seen);
    expect(limbs.legs).toHaveLength(4);
    const end = body.seen.at(-1) as (typeof body.seen)[number];
    expect(limbs.rear).toEqual({ x: end.c.x, y: end.c.y });
    // The tail and the legs go back with the body: smaller than side-on, never larger.
    expect(limbs.tailLook.r).toBeLessThan(r);
    const hind = limbs.legs[3] as { radii: readonly number[] };
    const fore = limbs.legs[2] as { radii: readonly number[]; bones: readonly Point[] };
    expect(hind.radii[0]).toBeLessThan(0.38 * r);
    expect(fore.radii[0]).toBeLessThan(0.28 * r);
  });
});
