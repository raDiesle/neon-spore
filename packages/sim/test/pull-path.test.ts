import { describe, expect, it } from "bun:test";
import {
  PULL_STRAY_MILLI,
  type PullPath,
  pullPathHeard,
  pullPathLength,
  pullPathNearest,
  pullPathPoint,
} from "../src/pull-path.js";

/**
 * **A pull whose path bends** (`pull-path.ts`): progress measured along a
 * polyline, a thumb wandering off it failing the pull, and everything else
 * the straight pull's — the PULL LAB's curve and stray rule on the tick.
 */

/** Down two tiles, then right two: an L, four tiles long. */
const L: PullPath = {
  pts: [
    { x: 0, y: 0 },
    { x: 0, y: 2000 },
    { x: 2000, y: 2000 },
  ],
};

/** Down three tiles, a tile right, and back up: a curve that doubles back. */
const HAIRPIN: PullPath = {
  pts: [
    { x: 0, y: 0 },
    { x: 0, y: 3000 },
    { x: 1000, y: 3000 },
    { x: 1000, y: 0 },
  ],
};

describe("a path's length and its points", () => {
  it("is the sum of its segments, a diagonal by the integer root", () => {
    expect(pullPathLength(L)).toBe(4000);
    expect(
      pullPathLength({
        pts: [
          { x: 0, y: 0 },
          { x: 3000, y: 4000 },
        ],
      }),
    ).toBe(5000);
  });

  it("finds the point that far along, and holds to its ends", () => {
    expect(pullPathPoint(L, 1000)).toEqual({ x: 0, y: 1000 });
    expect(pullPathPoint(L, 3000)).toEqual({ x: 1000, y: 2000 });
    expect(pullPathPoint(L, -500)).toEqual({ x: 0, y: 0 });
    expect(pullPathPoint(L, 9000)).toEqual({ x: 2000, y: 2000 });
  });
});

describe("the nearest point to a thumb", () => {
  it("is the foot on the segment, and how far off it the thumb is", () => {
    const n = pullPathNearest(L, 1500, 300, 1500);
    expect(n.alongMilli).toBe(1500);
    expect(n.offSq).toBe(300 * 300);
  });

  it("is looked for near the knob, so a hairpin is not jumped across", () => {
    // Between the two legs, with the knob on the way down: the first leg's.
    const n = pullPathNearest(HAIRPIN, 1000, 400, 1000);
    expect(n.alongMilli).toBe(1000);
    // The same place with the knob on the way back up is the far leg's.
    const back = pullPathNearest(HAIRPIN, 5500, 400, 1500);
    expect(back.alongMilli).toBeGreaterThan(4000);
  });
});

describe("a hand on a path", () => {
  it("is held along the way, and counts the moment it reaches the end", () => {
    expect(pullPathHeard(L, false, true, 0, 1200, 1000)).toEqual({
      travelMilli: 1200,
      heard: "held",
    });
    expect(pullPathHeard(L, false, true, 2000, 2000, 3600).heard).toBe("counted");
    expect(pullPathHeard(L, true, true, 2000, 2000, 4000).heard).toBe("held");
  });

  it("cuts the corner within the stray and keeps its progress", () => {
    // Inside the bend, a little off both legs.
    const r = pullPathHeard(L, false, true, 300, 1700, 1800);
    expect(r.heard).toBe("held");
    expect(r.travelMilli).toBeGreaterThan(1500);
  });

  it("fails off the path past the stray, the knob home", () => {
    const off = PULL_STRAY_MILLI + 100;
    expect(pullPathHeard(L, false, true, off, 1000, 1000)).toEqual({
      travelMilli: 0,
      heard: "strayed",
    });
    // And a lift off the path is the same failure.
    expect(pullPathHeard(L, false, false, off, 1000, 1000).heard).toBe("strayed");
  });

  it("cannot stray once it has counted: the hand is only coming home", () => {
    expect(pullPathHeard(L, true, true, 5000, 5000, 4000).heard).toBe("held");
    expect(pullPathHeard(L, true, false, 5000, 5000, 4000).heard).toBe("home");
  });

  it("is a straight pull's short lift and tap otherwise", () => {
    expect(pullPathHeard(L, false, false, 0, 1500, 1500).heard).toBe("short");
    expect(pullPathHeard(L, false, false, 0, 20, 0).heard).toBe("home");
  });
});
