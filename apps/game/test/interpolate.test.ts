import { describe, expect, it } from "bun:test";
import { interpolatedBeatPhase, interpolationRequested } from "../src/interpolate.js";

/**
 * The flag, and what it decides. `raster.test.ts` is the model: the rule that
 * keeps a look off the field is pure, so it is checked without a browser.
 */
describe("the interpolate flag", () => {
  it("is off unless it is asked for", () => {
    expect(interpolationRequested("http://game.invalid/")).toBe(false);
    expect(interpolationRequested("http://game.invalid/?play=1")).toBe(false);
    expect(interpolationRequested("http://game.invalid/?interpolate=0")).toBe(false);
  });

  it("is on for the ways somebody would type it", () => {
    expect(interpolationRequested("http://game.invalid/?interpolate=1")).toBe(true);
    expect(interpolationRequested("http://game.invalid/?interpolate")).toBe(true);
    expect(interpolationRequested("http://game.invalid/?play=1&interpolate=on")).toBe(true);
  });
});

describe("the beat phase a frame between two ticks is drawn at", () => {
  it("is the shipped one when the frame lands on the tick", () => {
    expect(interpolatedBeatPhase(5, 0, 8)).toBeCloseTo(5 / 8, 10);
  });

  it("leads the tick by its share of the next one", () => {
    expect(interpolatedBeatPhase(5, 0.5, 8)).toBeCloseTo(5.5 / 8, 10);
  });

  it("wraps into the next beat rather than reaching 1", () => {
    expect(interpolatedBeatPhase(7, 0.7, 8)).toBeCloseTo(7.7 / 8, 10);
    expect(interpolatedBeatPhase(7, 1, 8)).toBeCloseTo(0, 10);
  });
});
