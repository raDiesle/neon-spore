import { describe, expect, it } from "bun:test";
import { INSTAR_FLIGHT_LOOK } from "../src/instar-flight-look.js";
import { frontBody } from "../src/instar-front-body.js";
import type { Look } from "../src/instar-plate.js";
import { BODY_DEPTH, BODY_LENS } from "../src/instar-turn.js";

/**
 * **What THE INSTAR looks like while it flies** (`instar-flight-look.ts`):
 * shipped, the record changes nothing — the pose is the morph's and the body
 * keeps its plates; a body `smooth` all the way is one taper, thinning
 * steadily from the neck to the far end with no pinch at any seam.
 */

const NECK = { x: 0, y: 0 };
const REAR = { x: 120, y: -200 };
const AT = { arrive: "approach", t: 0.3, leaves: false } as const;

function radii(smooth: number | undefined): number[] {
  const look = { r: 40, time: 1, smooth } as Look;
  return frontBody(look, NECK, REAR, 0).rings.map((g) => g.r);
}

describe("THE INSTAR's flight look", () => {
  it("ships as the identity: the morph's own pose and a body of plates", () => {
    const f = { side: 0.2 } as Parameters<typeof INSTAR_FLIGHT_LOOK.figure>[0];
    expect(INSTAR_FLIGHT_LOOK.figure(f, AT)).toBe(f);
    expect(INSTAR_FLIGHT_LOOK.body(AT)).toBe(0);
    expect(radii(0)).toEqual(radii(undefined));
  });

  it("pinches a plated body at each seam, and draws a smooth one as a single taper", () => {
    const plated = radii(0);
    const pinched = plated.some((r, i) => i > 0 && r > (plated[i - 1] as number));
    expect(pinched).toBe(true);
    // In screen terms the lens divides each ring back out, so the taper is read on the rig's own girth.
    const smooth = radii(1).map(
      (r, i, all) => r * (BODY_LENS / (BODY_LENS + (i / (all.length - 1)) * BODY_DEPTH)),
    );
    for (let i = 1; i < smooth.length; i++) {
      expect(smooth[i] as number).toBeLessThan(smooth[i - 1] as number);
    }
  });
});
