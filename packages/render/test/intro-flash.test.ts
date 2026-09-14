import { describe, expect, it } from "bun:test";
import { INTRO_ACCENT, stamp, surge } from "../src/intro-flash.js";
import { PALETTE } from "../src/palette.js";

/**
 * The effect the owner asked for by name: *elements coming toward the screen
 * and going back again.* It outlived the six pages it was written for — none
 * of it was ever the stepper's — and the one scene carries it unchanged.
 *
 * The picture of it is his to judge and no test here has an opinion about how
 * far is far enough. What these hold is the arithmetic underneath it, which is
 * the half that can be wrong silently: a cycle that does not come back where
 * it started, a stamp that is already there when the scene opens, and two
 * elements that turn out to be moving together. The transform it leaves behind
 * is `intro.test.ts`, over the scene it is drawn in.
 */

describe("the trip toward the reader and back", () => {
  it("starts at the back and returns there, so a page does not jump", () => {
    // The scene opens at age 0, and opens at 0 again every time somebody asks
    // for it. If the cycle did not close, the second showing would start
    // mid-trip.
    expect(surge(0)).toBeCloseTo(0, 6);
    expect(surge(3.4)).toBeCloseTo(0, 6);
    expect(surge(6.8)).toBeCloseTo(0, 6);
  });

  it("arrives all the way at the near end", () => {
    expect(surge(1.7)).toBeCloseTo(1, 6);
  });

  it("never leaves the range the scales are built on", () => {
    // Both callers read it as 0..1 and turn it into a scale and an alpha. An
    // alpha outside that range is what the strict canvas refuses outright.
    for (let age = 0; age < 14; age += 0.017) {
      const d = surge(age);
      expect(d, `age ${age}`).toBeGreaterThanOrEqual(0);
      expect(d, `age ${age}`).toBeLessThanOrEqual(1);
    }
  });

  it("puts the tag's plane opposite the picture's", () => {
    // Half a turn apart is the whole of why the corner reads as a second
    // plane: at the two ends of the trip one of them is at the glass and the
    // other has to be at the back. They cross in between, which is fine — a
    // moment where both are mid-air is a moment, not a plane.
    expect(surge(1.7)).toBeGreaterThan(0.99);
    expect(surge(1.7, 0.5)).toBeLessThan(0.01);
    expect(surge(0)).toBeLessThan(0.01);
    expect(surge(0, 0.5)).toBeGreaterThan(0.99);
  });
});

describe("how the tag arrives", () => {
  it("is not on the screen when the scene opens", () => {
    // A sign that was already there is furniture. The whole of what makes one
    // work is that it lands.
    expect(stamp(0)).toBe(0);
    expect(stamp(0.34)).toBe(0);
  });

  it("overshoots on the way in and settles at its own size", () => {
    const trip: number[] = [];
    for (let age = 0.34; age <= 0.76; age += 0.005) trip.push(stamp(age));
    expect(Math.max(...trip)).toBeGreaterThan(1.03);
    expect(stamp(0.76)).toBeCloseTo(1, 6);
    expect(stamp(40)).toBeCloseTo(1, 6);
  });
});

describe("the colour the intro is advertised in", () => {
  it("is one the game already has", () => {
    const known: string[] = Object.values(PALETTE);
    expect(known).toContain(INTRO_ACCENT.hex);
    expect(known).toContain(INTRO_ACCENT.rim);
  });

  it("is none of the greens the palette has reserved", () => {
    // `palette.ts` keeps four greens for four things on the field, and the
    // first of them means *this went right*. A green banner over the front
    // door would be the one claim the intro must not be able to make by
    // accident — it has nothing to be right about yet.
    const reserved: string[] = [
      PALETTE.good,
      PALETTE.claspShield,
      PALETTE.eyeFluid,
      PALETTE.venom,
      PALETTE.goodRim,
      PALETTE.claspShieldRim,
      PALETTE.eyeFluidRim,
      PALETTE.venomRim,
    ];
    expect(reserved).not.toContain(INTRO_ACCENT.hex);
    expect(reserved).not.toContain(INTRO_ACCENT.rim);
  });
});
