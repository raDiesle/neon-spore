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

/**
 * Eighty moments over the same thirty-four seconds two hundred used to cover,
 * and the reduction is deliberate: a smaller sample is a weaker guarantee, so
 * here is what was measured before it was taken.
 *
 * A memo is the answer this file cannot use. `shape-fit.ts` keeps one because
 * the page asks for the same fit again on every skin switch; here every
 * `(subject, t)` pair in the sweep is asked for exactly once, and a table of
 * answers nothing looks up twice is only a table. What could be shared was
 * shared instead — `transformedBounds` used to build each contour twice, and
 * that is fixed in `shapes-motion.ts` where the whole sheet gets it.
 *
 * What is left is one contour per entry per sample, and the sample count is
 * the only lever. The box the fit returns is not tight: across the whole
 * catalogue the closest any drawn point comes to an edge is 1.58% of the
 * frame's span, at SPIKE around t=29.7. At eighty samples the same sweep finds
 * 1.66% at t=29.5 — the same near-miss, from a step away — so the density was
 * never what the claim rested on, and dropping it costs 0.08 points of a
 * margin that has four percent built into it on purpose.
 *
 * The step is chosen against the frame rather than for a round number: the fit
 * scans at 0.16 s and the wobble's period is 2π/0.9, and 0.4213 divides neatly
 * into neither, so the sweep keeps landing between the moments the frame was
 * fitted over — which is the whole point of sampling *later* at all.
 */
const LATER = Array.from({ length: 80 }, (_, i) => i * 0.4213);

type Apply = (x: number, y: number) => { x: number; y: number };

/** The identity, for a shape whose motion writes no transform at all. */
const AS_DRAWN: Apply = (x, y) => ({ x, y });

function applier(transform: string): Apply {
  // The transform the panel writes, read back: translate, rotate, scale,
  // translate. Parsed rather than re-derived, so this tests the string that
  // actually reaches the DOM and not a second copy of the arithmetic.
  //
  // Parsed once per transform and not once per point: the string is the same
  // for every point of a pose, and re-running the regex and the two
  // trigonometric calls per point was what made this file the slowest in the
  // director's suite.
  if (transform === "") return AS_DRAWN;
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
  const r = (deg * Math.PI) / 180;
  const cos = Math.cos(r);
  const sin = Math.sin(r);
  return (x, y) => {
    const px = (x + bx) * sx;
    const py = (y + by) * sy;
    return { x: tx + px * cos - py * sin, y: ty + px * sin + py * cos };
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
      //
      // One assertion per entry rather than four per point: the comparison is
      // the same, and an `expect` for every sample times every contour point
      // cost this file five of the director suite's six seconds. A point that
      // escapes names itself in the failure instead.
      const outside: string[] = [];
      for (const t of LATER) {
        const pts = entry.subject.pointsAt(t);
        const apply = applier(motionTransform(entry.motion, t, pivot, tile));
        for (const p of pts) {
          const q = apply(p.x, p.y);
          if (q.x <= b.x0 || q.x >= b.x1 || q.y <= b.y0 || q.y >= b.y1)
            outside.push(`t=${t.toFixed(2)} (${q.x.toFixed(1)}, ${q.y.toFixed(1)})`);
        }
      }
      expect(outside).toEqual([]);
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
