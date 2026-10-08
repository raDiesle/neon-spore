import { describe, expect, it } from "bun:test";
import { antiphonAlikeTurned, DEFAULT_CONFIG } from "@neon-spore/sim";
import { ANTIPHON_CONTOURS, antiphonRadiusMul } from "../src/antiphon-contours.js";

/**
 * **A turned contour is another candidate** — on a level whose organ rests
 * at a quarter turn (`sim/antiphon-turn.ts`), the rail's decoys are the
 * organ's own contour at the other quarter turns, so a contour that looks the
 * same a quarter, a half or three quarters round is a rail showing two
 * identical candidates of which only one is right.
 *
 * Measured as the worst gap between the contour and itself turned, in radii,
 * at the least favourable moment of its breathing. A contour the same at a
 * half turn — a crystal with an even number of facets, *four facets* — is
 * allowed only if the simulation is told so in `antiphonHalfAlike`, which
 * gives it a decoy of another shape there (`sim/antiphon-turn.ts`; the
 * owner's choice, 8 October 2026). This file is that number's measure: a
 * contour added or changed moves it here first.
 */

/** A gap smaller than this, in radii, is not one the chooser can be asked to see. */
const SEEN = 0.05;
/** Whether the simulation is told contour `shape` is the same `quarters` round. */
const told = (shape: number, quarters: number) =>
  antiphonAlikeTurned(DEFAULT_CONFIG, shape, quarters);

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
      const alike = told(shape, q);
      it(`${shape}, ${said}, ${alike ? "is the same" : "differs"} at ${q} quarter${q > 1 ? "s" : ""}`, () => {
        if (alike) expect(gap(shape, q)).toBeLessThan(SEEN);
        else expect(gap(shape, q)).toBeGreaterThan(SEEN);
      });
    }
  }
});
