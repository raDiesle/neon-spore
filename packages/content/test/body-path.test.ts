import { describe, expect, it } from "bun:test";
import type { CreatureSilhouette, Point } from "../src/index.js";
import {
  BULB,
  livingPath,
  livingPoints,
  rimCount,
  SLICK,
  THROB,
  walkedSilhouette,
} from "../src/index.js";

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

/**
 * A silhouette carrying a contour of its own — the seam that lets a form from
 * the shape collection be offered on a body that ships. The walk has to be
 * the form's, and the two numbers everything else reads have to be true of it.
 */
describe("a walked contour", () => {
  /** Five small bodies sharing one skin, parting and closing with `t` — the
   * shape of `cluster` in the collection, small enough to write here. */
  const cluster = (t: number): Point[] => {
    const pts: Point[] = [];
    const part = 1 + 0.5 * Math.sin(t);
    for (let i = 0; i < 60; i++) {
      const a = (i / 60) * Math.PI * 2;
      const m = 1 + 0.35 * Math.cos(5 * a);
      pts.push({ x: Math.cos(a) * 30 * m * part, y: Math.sin(a) * 20 * m });
    }
    return pts;
  };
  const CLUSTER = walkedSilhouette(
    { lobes: 5, depth: 0.35, wobble: 0, seed: 0, sizeMul: 0.9 },
    cluster,
  );

  it("is walked rather than sampled, and ignores the sample count", () => {
    for (const t of TIMES) {
      expect(livingPoints(CLUSTER, t)).toEqual(cluster(t));
      expect(livingPoints(CLUSTER, t, 7)).toEqual(cluster(t));
    }
  });

  it("takes rx and ry off the contour's own reach, at its furthest", () => {
    // The form is widest when `sin(t)` is one, and the bounding ellipse has to
    // hold that moment rather than the one it happened to be built at.
    let rx = 0;
    let ry = 0;
    for (let t = 0; t < 12; t += 0.05) {
      for (const p of cluster(t)) {
        rx = Math.max(rx, Math.abs(p.x));
        ry = Math.max(ry, Math.abs(p.y));
      }
    }
    expect(CLUSTER.rx).toBeCloseTo(rx, 0);
    expect(CLUSTER.ry).toBeCloseTo(ry, 0);
    for (const t of TIMES) {
      for (const p of livingPoints(CLUSTER, t)) {
        // Within a percent: the reach is sampled, and a moment between two
        // samples may reach a hair past the one that set the ellipse.
        expect(Math.abs(p.x)).toBeLessThanOrEqual(CLUSTER.rx * 1.01);
        expect(Math.abs(p.y)).toBeLessThanOrEqual(CLUSTER.ry * 1.01);
      }
    }
  });

  it("keeps the author's count and size, and takes precedence over clubs", () => {
    expect(rimCount(CLUSTER)).toBe(5);
    expect(CLUSTER.sizeMul).toBe(0.9);
    const both: CreatureSilhouette = { ...THROB, contour: cluster };
    expect(livingPoints(both, 1)).toEqual(cluster(1));
  });

  it("refuses a contour with no reach", () => {
    expect(() =>
      walkedSilhouette({ lobes: 1, depth: 0, wobble: 0, seed: 0 }, () => [{ x: 0, y: 0 }]),
    ).toThrow();
  });

  it("can be patched onto a shipped body the way VERSUS patches one", () => {
    // The whole point: a shipped record with the form's contour written over
    // it, drawn through the same call every draw site makes, and put back.
    const before = livingPath(SLICK, 1);
    const kept = { rx: SLICK.rx, ry: SLICK.ry };
    Object.assign(SLICK, { contour: CLUSTER.contour, rx: CLUSTER.rx, ry: CLUSTER.ry });
    try {
      expect(livingPoints(SLICK, 1)).toEqual(cluster(1));
    } finally {
      Object.assign(SLICK, kept);
      delete (SLICK as { contour?: unknown }).contour;
    }
    expect(livingPath(SLICK, 1)).toBe(before);
  });
});
