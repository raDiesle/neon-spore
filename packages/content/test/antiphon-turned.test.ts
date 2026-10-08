import { describe, expect, it } from "bun:test";
import { ANTIPHON_CONTOURS, antiphonRadiusMul } from "../src/antiphon-contours.js";

/**
 * **A turned contour is another candidate** — on a level whose organ rests
 * at a quarter turn (`sim/antiphon-turn.ts`), the rail's decoys are the
 * organ's own contour at the other quarter turns, so a contour that looks the
 * same a quarter, a half or three quarters round is a rail showing two
 * identical candidates of which only one is right.
 *
 * Measured as the worst gap between the contour and itself turned, in radii,
 * at the least favourable moment of its breathing. One contour is known to
 * fail, and is named here rather than hidden: a crystal with an even number
 * of facets is the same upside down. Which way it is mended is the owner's
 * (`docs/queue.md`); this list goes when it is.
 */

/** A gap smaller than this, in radii, is not one the chooser can be asked to see. */
const SEEN = 0.05;
/** The contours known to look the same at a turn: index, and quarters. */
const ALIKE: readonly (readonly [shape: number, quarters: number])[] = [[9, 2]];

function gap(shape: number, quarters: number): number {
  let least = Number.POSITIVE_INFINITY;
  for (const t of [0, 1, 2.5, 7]) {
    let worst = 0;
    for (let i = 0; i < 360; i++) {
      const b = (i / 360) * Math.PI * 2;
      const turned = antiphonRadiusMul(shape, b - (quarters * Math.PI) / 2, t);
      worst = Math.max(worst, Math.abs(antiphonRadiusMul(shape, b, t) - turned));
    }
    least = Math.min(least, worst);
  }
  return least;
}

describe("THE ANTIPHON's contours turned", () => {
  for (let shape = 0; shape < ANTIPHON_CONTOURS.length; shape++) {
    const said = ANTIPHON_CONTOURS[shape]?.said ?? "";
    for (const q of [1, 2, 3]) {
      const alike = ALIKE.some(([s, n]) => s === shape && n === q);
      it(`${shape}, ${said}, ${alike ? "is the same" : "differs"} at ${q} quarter${q > 1 ? "s" : ""}`, () => {
        if (alike) expect(gap(shape, q)).toBeLessThan(SEEN);
        else expect(gap(shape, q)).toBeGreaterThan(SEEN);
      });
    }
  }
});
