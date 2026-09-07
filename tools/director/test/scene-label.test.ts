import { describe, expect, test } from "bun:test";
import { computeLayout, type Layout } from "@neon-spore/render";
import type { Scene } from "@neon-spore/shape-sheet";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { placeBodies } from "../src/scene-art.js";

/**
 * Where a scene body's label goes, which is a question about the *body* and
 * not about the lane it stands in.
 *
 * The offset used to be half a tile below the middle. That is right for a
 * creature, which draws four fifths of a lane across, and it is inside the
 * outline for anything wider: THE WEIGHT is three lanes and puts its label
 * across its own sac, and the seven-lane bosses would put it near the middle.
 * So the number has to come off what was drawn, and this is the test that says
 * so — one lane and three lanes, with the same shape and the same label.
 */

const LAYOUT: Layout = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "p1");
const same = (x: number, y: number) => ({ x, y });

function place(span: number, turn?: number) {
  const scene: Scene = {
    suggests: "THE WEIGHT",
    role: "p1",
    claim: "a body with a word under it",
    bodies: [{ shape: "THE WEIGHT", col: 4, row: 6, span, turn, label: "the seam, parted" }],
  };
  const [body] = placeBodies(scene, LAYOUT, same, 1);
  if (!body) throw new Error("the catalogue no longer carries THE WEIGHT");
  return body;
}

describe("a scene body's label", () => {
  test("clears a body three lanes wide, not just a body one lane wide", () => {
    const wide = place(3);
    // The old offset, kept here as the number this is a fix to: half a tile
    // below the middle is inside a three-lane contour.
    expect(wide.halfHeight).toBeGreaterThan(LAYOUT.tile * 0.5);
  });

  test("grows with the body rather than with the lane", () => {
    const one = place(1);
    const three = place(3);
    expect(three.halfHeight).toBeGreaterThan(one.halfHeight * 2.5);
    // A creature's word stays about where it always was: `tile * 0.5` was that
    // body's half-height and a tenth of a lane of air under it.
    expect(one.halfHeight).toBeLessThan(LAYOUT.tile * 0.5);
    expect(one.halfHeight).toBeGreaterThan(LAYOUT.tile * 0.3);
  });

  test("counts a leaning body's reach rather than its own height", () => {
    const upright = place(1);
    const leaning = place(1, 90);
    expect(leaning.halfHeight).not.toBeCloseTo(upright.halfHeight, 3);
  });
});
