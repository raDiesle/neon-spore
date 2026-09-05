import { describe, expect, it } from "bun:test";
import type { CreatureSilhouette } from "../src/index.js";
import { BULB, livingPath, livingPoints, rimCount, SLICK, THROB } from "../src/index.js";

/**
 * THE THROB's rim, and the one property the creature cannot work without.
 *
 * The body turns clockwise and which half is pointing at the cannon is what a
 * shot meets (`sim/throb.ts`). A round contour cannot show that it is turning
 * at all — that is the whole reason this kind wears clubs rather than lobes —
 * so what is checked here is that the clubs are *there*, that they stand out
 * far enough to read as a bearing, and that the walk that draws them never
 * tears. A torn outline is the one way this form can be drawn wrongly rather
 * than not drawn: `tools/shape-sheet/src/forms/clubbed.ts` documents the cap
 * that reaches back inside the rim and comes out as a barb.
 */

const TIMES = [0, 0.4, 1.7, 6.3, 19.9];

/** How far the contour reaches from the centre, at its widest and narrowest. */
function span(s: CreatureSilhouette, t: number): { near: number; far: number } {
  let near = Infinity;
  let far = 0;
  for (const p of livingPoints(s, t)) {
    const r = Math.hypot(p.x, p.y);
    near = Math.min(near, r);
    far = Math.max(far, r);
  }
  return { near, far };
}

describe("a clubbed rim", () => {
  it("draws a finite outline at every moment", () => {
    for (const t of TIMES) {
      const pts = livingPoints(THROB, t);
      expect(pts.length).toBeGreaterThan(100);
      for (const p of pts) expect(Number.isFinite(p.x) && Number.isFinite(p.y)).toBe(true);
    }
    for (const t of TIMES) expect(livingPath(THROB, t)).not.toContain("NaN");
  });

  it("never folds back through its own centre", () => {
    // A cap seated nearer the rim than its own radius reaches inside the body,
    // and the walk then crosses the rim twice: the outline comes back as a barb
    // hanging off a broken contour. `jitter`'s clamp is what stops it, and this
    // is the failure that clamp exists for, at every phase of the breath.
    for (let t = 0; t < 24; t += 0.25) {
      expect(span(THROB, t).near).toBeGreaterThan(THROB.rx * 0.4);
    }
  });

  it("stands its clubs far enough out to be a bearing", () => {
    // Under about a third past the core there is no stalk to see, and a body
    // whose knobs sit on its rim is a lobed body with extra steps — which is
    // exactly the shape this creature was moved off.
    const { near, far } = span(THROB, 0);
    expect(far / near).toBeGreaterThan(1.4);
  });

  it("draws no wider than the roundest body it stands beside", () => {
    // `drawLiving` scales `max(rx, ry)` onto one fixed radius for every living
    // kind and then applies `sizeMul`, so this is the whole of the claim
    // `THROB.sizeMul` is written to make: a throb takes up a bulb's room on the
    // field, clubs and all, rather than half a lane more.
    // Over the whole breath, not at one moment: a club is at its longest on
    // the crest of its own cycle, and that is the frame that has to fit.
    const reach = (s: CreatureSilhouette): number =>
      Math.max(...TIMES.map((t) => span(s, t).far)) * ((s.sizeMul ?? 1) / Math.max(s.rx, s.ry));
    expect(reach(THROB)).toBeLessThanOrEqual(reach(BULB));
    expect(reach(THROB)).toBeGreaterThan(reach(BULB) * 0.85);
  });

  it("counts its clubs where a lobed body counts its lobes", () => {
    expect(THROB.clubs).toBeDefined();
    expect(rimCount(THROB)).toBe(THROB.clubs?.clubs ?? 0);
    expect(rimCount(SLICK)).toBe(SLICK.lobes);
  });
});
