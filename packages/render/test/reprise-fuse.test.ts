import { describe, expect, it } from "bun:test";
import { repriseMeasure } from "../src/reprise-fuse.js";

/**
 * THE REPRISE's fuse is one line carrying two clocks, and what has to hold is
 * that the two meet: it is empty on the beat the dark falls and whole on the
 * beat the last body goes, so the burn and the fill hand over without a jump.
 */
describe("THE REPRISE's fuse", () => {
  it("burns down over a stretch and is gone on the beat the dark falls", () => {
    const at = (done: number, phase: number) =>
      repriseMeasure({ echo: false, beats: 12, done, count: 0 }, phase);
    expect(at(0, 0).rest).toBe(1);
    expect(at(6, 0).rest).toBeCloseTo(0.5);
    expect(at(11, 0.5).left).toBeCloseTo(0.5);
    expect(at(11, 0.999).rest).toBeLessThan(0.001);
  });

  it("fills over the echo and is whole on the beat the last body is sent", () => {
    // Seven beats of bodies: the clock reads 0..5 and the echo shuts on 6.
    const at = (done: number, phase: number) =>
      repriseMeasure({ echo: true, beats: 7, done, count: 1 }, phase);
    expect(at(0, 0).rest).toBe(0);
    expect(at(3, 0).rest).toBeCloseTo(0.5);
    expect(at(5, 0.999).rest).toBeGreaterThan(0.99);
  });

  it("never divides by nought on an echo of one row", () => {
    const m = repriseMeasure({ echo: true, beats: 1, done: 0, count: 2 }, 0.5);
    expect(m.rest).toBeCloseTo(0.5);
  });
});
