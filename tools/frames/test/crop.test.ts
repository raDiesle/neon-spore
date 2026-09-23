import { describe, expect, it } from "bun:test";
import { clipFor, onDocument, parseAt, parseCropArgs, sameFrames } from "../crop.js";

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

describe("onDocument", () => {
  /** A viewport box plus the window's scroll is the document box the clip
   * wants; with no scroll the two are one, which is why `#stage` never
   * showed the difference. */
  it("puts the scroll back onto a box measured after it", () => {
    expect(onDocument({ x: 12, y: 40 }, { x: 0, y: 80 })).toEqual({ x: 12, y: 120 });
    expect(onDocument({ x: 12, y: 40 }, { x: 0, y: 0 })).toEqual({ x: 12, y: 40 });
  });
});

describe("parseCropArgs", () => {
  const want = { input: "a.png", output: "b.png", rect: "0,700,150,450", zoom: 3 };

  it("reads the positional spelling", () => {
    expect(parseCropArgs(["a.png", "b.png", "0,700,150,450", "3"])).toEqual(want);
  });

  it("reads versus:shot's spelling of the same two numbers", () => {
    expect(parseCropArgs(["a.png", "b.png", "--at", "0,700,150,450", "--zoom", "3"])).toEqual(want);
    expect(parseCropArgs(["a.png", "b.png", "--at=0,700,150,450", "--scale=3"])).toEqual(want);
    expect(parseCropArgs(["a.png", "b.png", "--at", "0,700,150,450", "3"])).toEqual(want);
  });

  it("magnifies four times when nobody says", () => {
    expect(parseCropArgs(["a.png", "b.png", "--at", "1,1,2,2"]).zoom).toBe(4);
  });

  it("names the word it did not understand", () => {
    expect(() => parseCropArgs(["a.png", "b.png", "--rect", "1,1,2,2"])).toThrow(/--rect/);
    expect(() => parseCropArgs(["a.png", "b.png", "1,1,2,2", "3", "9"])).toThrow(/9 is more/);
    expect(() => parseCropArgs(["a.png", "b.png", "1,1,2,2", "1.5"])).toThrow(/whole number/);
    expect(() => parseCropArgs(["a.png", "b.png"])).toThrow(/a rectangle/);
  });
});
