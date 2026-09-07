import { describe, expect, it } from "bun:test";
import type { Point } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { choirLoops } from "../src/choir-shape.js";
import { computeLayout } from "../src/layout.js";

/**
 * **THE CHOIR is two bodies until the gesture, and one after it.**
 *
 * This is the one thing about this creature that has been got wrong in four
 * separate drafts, every time by guessing a number instead of working it out.
 * The owner watched the pair join before he had shaken anything and said so
 * three times running; the last draft had a floor of 2.85 radii against a
 * parting threshold of 2.83, which is a margin of half a percent — nothing
 * against the 5% breath in a body's own radius, and nothing at all against a
 * grid that walks 22 cells, since marching squares bridges a gap thinner than
 * one of its cells whether the field parted or not.
 *
 * So it is checked rather than argued. `choirLoops` returns the traced rings,
 * and the count *is* the question: two means two bodies, one means they have
 * closed. Nothing here reads a pixel — a canvas could only say the picture had
 * some ink in it.
 */

const CFG = DEFAULT_CONFIG;
const L = computeLayout({ width: 390, height: 844, dpr: 2 }, CFG, "p1");
const AT = { x: 200, y: 200 };

const rings = (time: number, close = 0): Point[][] => choirLoops(L, AT.x, AT.y, time, close);

/**
 * A ring as a centre and a reach, which is what a gap between two of them
 * wants.
 *
 * **Not an extent along x**, which a first draft of this file used and which
 * is blind in exactly the direction the bug was in: the pair turns, so half
 * the time the two are stacked rather than side by side, and an x-only
 * measurement reads a vertical pair as fully overlapped.
 */
function disc(loop: Point[]): { x: number; y: number; r: number } {
  const x = loop.reduce((a, p) => a + p.x, 0) / loop.length;
  const y = loop.reduce((a, p) => a + p.y, 0) / loop.length;
  const r = Math.max(...loop.map((p) => Math.hypot(p.x - x, p.y - y)));
  return { x, y, r };
}

describe("a choir nobody has touched", () => {
  it("is two bodies at every moment of its drift", () => {
    // A whole cycle of the wide-and-back and of the turn, sampled far finer
    // than either: the failure this exists for was a *dip* — one instant where
    // the two happened to touch — so a handful of samples would have missed it
    // exactly as three drafts of this file did.
    const joined: number[] = [];
    for (let t = 0; t < 24; t += 0.05) {
      if (rings(t).length !== 2) joined.push(Math.round(t * 100) / 100);
    }
    expect(joined, `the two joined on their own at t = ${joined.join(", ")}`).toEqual([]);
  });

  it("keeps real space between them, not merely a topological gap", () => {
    // Two rings is the *trace's* answer and it can be true of two shapes that
    // touch at a point. What the owner is looking at is a gap, so the gap is
    // what is measured: at the numbers in `choir-shape.ts` the two bodies are
    // about 3.5 radii apart, which leaves half a body's width of clear field
    // between them. Two pixels would pass the ring count and fail an eye.
    for (let t = 0; t < 24; t += 0.25) {
      const [a, b] = rings(t).map(disc);
      if (!a || !b) continue;
      const gap = Math.hypot(b.x - a.x, b.y - a.y) - a.r - b.r;
      expect(gap, `only ${gap.toFixed(1)}px between the two at t = ${t}`).toBeGreaterThan(
        L.tile * 0.08,
      );
    }
  });
});

describe("a choir the gesture is closing", () => {
  it("is one body once the closing has run", () => {
    for (let t = 0; t < 24; t += 0.5) {
      expect(rings(t, 1).length, `still apart at t = ${t}`).toBe(1);
    }
  });

  it("has already joined halfway through, so the closing is a body and not a jump", () => {
    // `close` halves the separation, so half way through the fuse the two are
    // 1.75 to 2.0 radii apart — inside the threshold, one shape with a waist.
    // That is the picture: they travel together, join, and then the waist
    // fills. A pair still visibly separate at the end of the fuse would snap
    // shut on the last frame instead.
    for (let t = 0; t < 24; t += 0.5) {
      expect(rings(t, 0.5).length, `still two at t = ${t}`).toBe(1);
    }
  });
});
