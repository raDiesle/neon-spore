import { describe, expect, it } from "bun:test";
import { boundsOver, CATALOGUE, WOBBLE_PERIOD } from "@neon-spore/shape-sheet";
import { motionTransform, tilePixels, transformedBounds } from "../src/shapes-motion.js";

/**
 * The one failure a catalogue of animated shapes must not have: a card fitted
 * to a shape standing still, and the shape then walking off the edge of it.
 * It reads as the shape being wrong rather than the card being small, which is
 * the opposite of what the page is for.
 *
 * So the box is checked against the *drawn* pose, at moments the fit never
 * sampled — the panel fits over one wobble, and own-motion has periods of its
 * own that are nowhere near it.
 */
const FIT_TIMES = [0, 0.2, 0.4, 0.6, 0.8].map((f) => f * WOBBLE_PERIOD);
const LATER = Array.from({ length: 200 }, (_, i) => i * 0.17);

function applied(x: number, y: number, transform: string): { x: number; y: number } {
  // The transform the panel writes, read back: translate, rotate, scale,
  // translate. Parsed rather than re-derived, so this tests the string that
  // actually reaches the DOM and not a second copy of the arithmetic.
  const nums = [...transform.matchAll(/-?\d+(?:\.\d+)?/g)].map(Number);
  const [tx, ty, deg, sx, sy, bx, by] = nums as [
    number,
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  const px = (x + bx) * sx;
  const py = (y + by) * sy;
  const r = (deg * Math.PI) / 180;
  return {
    x: tx + px * Math.cos(r) - py * Math.sin(r),
    y: ty + px * Math.sin(r) + py * Math.cos(r),
  };
}

describe("a card's frame", () => {
  for (const entry of CATALOGUE) {
    it(`${entry.subject.name} never leaves the box it was fitted to`, () => {
      const still = boundsOver(entry.subject, FIT_TIMES);
      const tile = tilePixels(still);
      const pivot = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
      const b = transformedBounds(entry.subject, entry.motion, FIT_TIMES, tile, pivot);

      // No tolerance: `transformedBounds` already carries its own margin, and
      // the whole claim under test is that the box it returns is the box the
      // shape stays inside. A tolerance here would only test the tolerance.
      for (const t of LATER) {
        const pts = entry.subject.pointsAt(t);
        const transform = motionTransform(entry.motion, t, pivot, tile);
        for (const p of pts) {
          const q = transform === "" ? p : applied(p.x, p.y, transform);
          expect(q.x).toBeGreaterThan(b.x0);
          expect(q.x).toBeLessThan(b.x1);
          expect(q.y).toBeGreaterThan(b.y0);
          expect(q.y).toBeLessThan(b.y1);
        }
      }
    });
  }

  it("writes no transform for a shape with no motion", () => {
    expect(motionTransform(undefined, 3, { x: 0, y: 0 }, 10)).toBe("");
  });

  it("measures a tile as the half-axis a creature is drawn at", () => {
    // `render/creatures.ts` fits a creature into a circle of tile * 0.4.
    expect(tilePixels({ x0: -40, x1: 40, y0: -20, y1: 20 })).toBeCloseTo(100, 6);
  });
});
