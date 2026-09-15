import { describe, expect, it } from "bun:test";
import { captionAt, framePath, parseBand, pngRatio, sheetMarkup } from "../sheet.js";

/**
 * The sheet a strip of frames is laid out as, in the halves that need no
 * browser.
 *
 * Three of the four things worth holding here were learned by getting them
 * wrong while watching the opening scene: a `file://` image in a page built
 * with `setContent` never loads, a cell that shrinks a whole phone shows
 * nothing moving, and a caption that assumes its own interval says the scene
 * ended six seconds before it did.
 */

describe("--band", () => {
  it("is the whole frame when nobody says otherwise", () => {
    expect(parseBand(undefined)).toEqual({ top: 0, bottom: 1 });
  });

  it("reads two fractions of the frame's height", () => {
    expect(parseBand("0.35,0.72")).toEqual({ top: 0.35, bottom: 0.72 });
    expect(parseBand(" 0 , 1 ")).toEqual({ top: 0, bottom: 1 });
  });

  it("refuses a band that is not one, rather than correcting it", () => {
    // `--at`'s rule, for `--at`'s reason: a band silently corrected is a
    // picture of the wrong part of the frame (`crop.ts`).
    expect(() => parseBand("0.5")).toThrow(/two fractions/);
    expect(() => parseBand("a,b")).toThrow(/two fractions/);
    expect(() => parseBand("-0.1,0.5")).toThrow(/0 to 1/);
    expect(() => parseBand("0.2,1.4")).toThrow(/0 to 1/);
    expect(() => parseBand("0.8,0.3")).toThrow(/under the top/);
  });
});

describe("the frames it reads", () => {
  it("names them the way a capture writes them, padded and in order", () => {
    expect(framePath("/tmp/intro", 0)).toBe("/tmp/intro-00.png");
    expect(framePath("/tmp/intro", 13)).toBe("/tmp/intro-13.png");
  });

  it("captions each one with the second it was taken at, not with its number", () => {
    // The throwaway this came from assumed its own interval and printed 9.1s
    // over a frame taken at 10.6, which is how a scene that runs for its full
    // length reads as one that ends early.
    expect(captionAt(0, 800)).toBe("0.0s");
    expect(captionAt(13, 800)).toBe("10.4s");
    expect(captionAt(13, 1000)).toBe("13.0s");
  });

  it("takes the frame's own shape off its header, so a cell knows what it holds", () => {
    // Eight bytes of a PNG, big endian: no image library, and the frames are
    // whatever the capture took.
    const png = new Uint8Array(24);
    new DataView(png.buffer).setUint32(16, 780);
    new DataView(png.buffer).setUint32(20, 1688);
    expect(pngRatio(png)).toBeCloseTo(1688 / 780, 5);
    expect(pngRatio(new Uint8Array(4))).toBe(1);
  });
});

describe("the page the sheet is a screenshot of", () => {
  const plan = {
    shots: ["/tmp/a-00.png", "/tmp/a-01.png"],
    cols: 2,
    cell: 240,
    band: { top: 0.25, bottom: 0.75 },
    everyMs: 800,
  };
  const html = sheetMarkup(plan, ["data:image/png;base64,AA", "data:image/png;base64,BB"], 2);

  it("inlines every frame, because a page with no origin cannot load a file", () => {
    // The first attempt at this was sixteen broken-image icons.
    expect(html).toContain("data:image/png;base64,AA");
    expect(html).not.toContain("file://");
  });

  it("shows a window onto each frame rather than the whole of it shrunk", () => {
    // A 390 by 844 phone in a 240 px cell is a dark rectangle. The window is
    // 240 * 2 * (0.75 - 0.25) tall, and the image is pulled up by the top of
    // the band.
    expect(html).toContain("height:240px");
    expect(html).toContain("margin-top:-120px");
    expect(html).toContain("overflow:hidden");
  });

  it("lays the cells out in the order they were taken, captioned", () => {
    expect(html).toContain("repeat(2,240px)");
    expect(html.indexOf("0.0s")).toBeLessThan(html.indexOf("0.8s"));
  });
});
