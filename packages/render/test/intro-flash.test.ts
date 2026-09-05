import { beforeAll, describe, expect, it } from "bun:test";
import { INTRO_PAGES } from "@neon-spore/content";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { accentFor, stamp, surge } from "../src/intro-flash.js";
import { drawIntroPage } from "../src/intro-page.js";
import { computeLayout } from "../src/layout.js";
import { PALETTE } from "../src/palette.js";
import { installCanvasGlobals, stubCanvas } from "./canvas-stub.js";

/**
 * The effect the owner asked for by name: *elements coming toward the screen
 * and going back again.*
 *
 * The picture of it is his to judge and no test here has an opinion about how
 * far is far enough. What these hold is the arithmetic underneath it, which is
 * the half that can be wrong silently — a cycle that does not come back where
 * it started, a stamp that is already there when the page opens, two elements
 * that turn out to be moving together, and a transform left open over the rest
 * of the game.
 */

beforeAll(installCanvasGlobals);

describe("the trip toward the reader and back", () => {
  it("starts at the back and returns there, so a page does not jump", () => {
    // Every page opens at age 0 and REPLAY sets it back to 0. If the cycle did
    // not close, paging away and back would cut between two different sizes.
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
  it("is not on the page when the page opens", () => {
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

describe("the colour a page is advertised in", () => {
  it("gives every page a hue and a rim out of the palette", () => {
    const known: string[] = Object.values(PALETTE);
    const hues = new Set<string>();
    for (const page of INTRO_PAGES) {
      const accent = accentFor(page.figure);
      expect(known, page.id).toContain(accent.hex);
      expect(known, page.id).toContain(accent.rim);
      hues.add(accent.hex);
    }
    // Six subjects, six colours: turning a page has to look like a change of
    // subject rather than the same screen with different words on it.
    expect(hues.size).toBe(INTRO_PAGES.length);
  });

  it("spends none of them on a green the palette has reserved", () => {
    // `palette.ts` keeps four greens for four things on the field, and the
    // first of them means *this went right*. A green flash over a menu would
    // be the one claim the intro must not be able to make by accident.
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
    for (const page of INTRO_PAGES) {
      const accent = accentFor(page.figure);
      expect(reserved, page.id).not.toContain(accent.hex);
      expect(reserved, page.id).not.toContain(accent.rim);
    }
  });
});

describe("what the page leaves behind it", () => {
  it("closes every transform it opens, at every point in the cycle", () => {
    // Three things on this page are drawn through a scale — the picture, the
    // tag, and a line of type landing — and the field is drawn under the intro
    // and goes on being drawn after it closes. One unbalanced `save` and the
    // rest of the game is played at the size of whichever frame dropped it.
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "p1");
    for (let page = 0; page < INTRO_PAGES.length; page++) {
      for (const age of [0, 0.45, 1.7, 3.4, 9]) {
        ctx.tally.clear();
        drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, page, age);
        expect(ctx.tally.get("save") ?? 0, `page ${page} at ${age}`).toBe(
          ctx.tally.get("restore") ?? 0,
        );
      }
    }
  });

  it("clips the picture, so the near end of the trip stays in its window", () => {
    // Without the clip a figure at the top of its cycle lands on the headline
    // above it, which is the difference between depth and a zoom.
    const { ctx } = stubCanvas();
    const l = computeLayout({ width: 900, height: 1600, dpr: 2 }, DEFAULT_CONFIG, "p1");
    ctx.tally.clear();
    drawIntroPage(ctx as unknown as CanvasRenderingContext2D, l, 0, 1.7);
    expect(ctx.tally.get("clip") ?? 0).toBeGreaterThan(0);
  });
});
