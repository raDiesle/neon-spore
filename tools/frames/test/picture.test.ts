import { describe, expect, it } from "bun:test";
import { encodePng, magnify } from "../picture.js";
import { decodePng, type Picture } from "../pixels.js";

/**
 * `bun run crop`'s two halves, held to what a person reaching for it needs:
 * the file it writes is a PNG the decoder next door reads back pixel for
 * pixel, and the rectangle comes out as the pixels asked for, each drawn
 * `zoom` times over — never a smoothed blend of two of them.
 */

/** A 3x2 RGBA picture with every pixel its own colour. */
function tiny(): Picture {
  const pixels = new Uint8Array(3 * 2 * 4);
  for (let i = 0; i < 6; i++) pixels.set([i * 40, 255 - i * 40, i * 10, 255], i * 4);
  return { width: 3, height: 2, pixels };
}

describe("encodePng", () => {
  it("writes a file decodePng reads back exactly", () => {
    const pic = tiny();
    const back = decodePng(encodePng(pic, 4));
    expect(back.width).toBe(3);
    expect(back.height).toBe(2);
    expect([...back.pixels]).toEqual([...pic.pixels]);
  });

  it("refuses a channel count PNG has no colour type for", () => {
    expect(() => encodePng(tiny(), 5)).toThrow(/channels/);
  });
});

describe("magnify", () => {
  it("draws each pixel of the rectangle zoom times over in both directions", () => {
    const pic = tiny();
    const out = magnify(pic, 4, { x: 1, y: 0, width: 2, height: 1 }, 3);
    expect(out.width).toBe(6);
    expect(out.height).toBe(3);
    // Pixel (1,0) is the second of the six; (2,0) the third. Three copies of
    // each across every one of the three rows, and no colour in between.
    const at = (x: number, y: number) => [
      ...out.pixels.subarray((y * 6 + x) * 4, (y * 6 + x) * 4 + 4),
    ];
    const second = [...pic.pixels.subarray(4, 8)];
    const third = [...pic.pixels.subarray(8, 12)];
    for (let y = 0; y < 3; y++) {
      for (let x = 0; x < 3; x++) expect(at(x, y)).toEqual(second);
      for (let x = 3; x < 6; x++) expect(at(x, y)).toEqual(third);
    }
  });

  it("clamps a rectangle reaching past the picture to its edge", () => {
    const pic = tiny();
    const out = magnify(pic, 4, { x: 2, y: 1, width: 2, height: 2 }, 1);
    const last = [...pic.pixels.subarray(20, 24)];
    for (let i = 0; i < 4; i++) expect([...out.pixels.subarray(i * 4, i * 4 + 4)]).toEqual(last);
  });

  it("refuses a zoom that is not a whole number of pixels", () => {
    expect(() => magnify(tiny(), 4, { x: 0, y: 0, width: 1, height: 1 }, 1.5)).toThrow(/whole/);
    expect(() => magnify(tiny(), 4, { x: 0, y: 0, width: 1, height: 1 }, 0)).toThrow(/whole/);
  });
});
