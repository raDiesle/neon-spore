import { describe, expect, it } from "bun:test";
import { clipFor, parseAt, sameFrames } from "../crop.js";

/**
 * The rectangle a capture is cropped to, and the comparison a crop must not be
 * able to lie to.
 *
 * `--at` exists because a body is about forty pixels across on a 390 px phone,
 * so a before-and-after of a change to its *shape* is two pictures nobody can
 * see the change in — and by `CLAUDE.md`'s rule that is the same as sending
 * none. Everything here is the part of that which needs no browser.
 */

describe("parseAt", () => {
  it("reads x,y,w,h in the frame's own pixels", () => {
    expect(parseAt("120,400,150,150")).toEqual({ x: 120, y: 400, width: 150, height: 150 });
  });

  it("ignores the spaces a person types", () => {
    expect(parseAt(" 0, 0 ,10,20 ")).toEqual({ x: 0, y: 0, width: 10, height: 20 });
  });

  /**
   * Refused rather than clamped, all four of them: a crop silently corrected
   * into a rectangle nobody asked for is a picture of the wrong thing, and the
   * whole point of the flag is that the caller says where to look.
   */
  it("refuses anything but four numbers", () => {
    expect(() => parseAt("1,2,3")).toThrow(/four numbers/);
    expect(() => parseAt("1,2,3,4,5")).toThrow(/four numbers/);
    expect(() => parseAt("1,2,3,x")).toThrow(/not a number/);
  });

  it("refuses a rectangle with no area, and one off the top left", () => {
    expect(() => parseAt("0,0,0,10")).toThrow(/no area/);
    expect(() => parseAt("0,0,10,-1")).toThrow(/no area/);
    expect(() => parseAt("-1,0,10,10")).toThrow(/top left/);
  });
});

describe("clipFor", () => {
  /** `page.screenshot` clips in page coordinates and the flag is written
   * against the frame, so the stage's own place is what closes the gap. */
  it("moves the crop onto the stage's place on the page", () => {
    expect(clipFor({ x: 12, y: 40 }, { x: 5, y: 6, width: 20, height: 30 })).toEqual({
      x: 17,
      y: 46,
      width: 20,
      height: 30,
    });
  });
});

describe("sameFrames", () => {
  it("is true for the same digests in the same order", () => {
    expect(sameFrames(["a", "b"], ["a", "b"])).toBe(true);
  });

  it("is false when one frame differs, or when there are not the same number", () => {
    expect(sameFrames(["a", "b"], ["a", "c"])).toBe(false);
    expect(sameFrames(["a"], ["a", "a"])).toBe(false);
  });
});
