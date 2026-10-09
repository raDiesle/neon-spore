import { describe, expect, it, setDefaultTimeout } from "bun:test";
import type { LeadState } from "@neon-spore/sim";
import { computeLayout } from "../src/layout.js";
import { leadFoot, leadStalkLength } from "../src/lead-shape.js";
import { scuttleBox, scuttleTop, scuttleWindRise } from "../src/scuttle-shape.js";
import { CFG, FRAME_TIMEOUT_MS, ROLES, VIEWPORT } from "./frame-harness.js";

setDefaultTimeout(FRAME_TIMEOUT_MS);

/**
 * A body hung above the grid stays on the canvas at any aspect (the owner, 27
 * September 2026: THE SCUTTLE's frame was cut off at the top on a stage wider
 * than 0.53). The tile is set by the height there, and only the radar's strip
 * is left above the grid, so the frame and THE LEAD's ridge come down by what
 * they are short of (`headroom.ts`). On a phone held upright there is room,
 * and nothing moves.
 */

const WIDE = [
  VIEWPORT,
  { width: 1600, height: 1600, dpr: 1 },
  { width: 1920, height: 1080, dpr: 1 },
];
const PHONE = { width: 390, height: 844, dpr: 3 };

/** THE LEAD with its whole stalk up, which is as tall as it ever stands. */
const TALL = { col: 3, segments: CFG.leadSegments } as unknown as LeadState;

describe("a body over the grid stays on the canvas", () => {
  for (const vp of WIDE) {
    for (const role of ROLES) {
      it(`THE SCUTTLE's frame, wound all the way back, at ${vp.width}×${vp.height} (${role})`, () => {
        const l = computeLayout(vp, CFG, role);
        // The frame comes down by exactly the shortfall, so one that needs
        // the drop lands on 0 give or take the arithmetic's last bit.
        expect(scuttleBox(l, CFG).top - scuttleWindRise(l, 1)).toBeGreaterThan(-1e-9);
      });
      it(`THE LEAD's full stalk at ${vp.width}×${vp.height} (${role})`, () => {
        const l = computeLayout(vp, CFG, role);
        const foot = leadFoot(l, CFG, TALL);
        expect(foot.y - leadStalkLength(l, TALL)).toBeGreaterThanOrEqual(0);
      });
    }
  }

  it("on a phone held upright the frame stands where it always did", () => {
    const l = computeLayout(PHONE, CFG, "p1");
    expect(scuttleTop(l, CFG)).toBe(l.gridTop);
  });
});
