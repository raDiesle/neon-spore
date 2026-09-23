import { describe, expect, it } from "bun:test";
import { directionFor, pair, toRgba } from "../pair.js";
import { encodePng } from "../picture.js";
import { decodePng, type Picture } from "../pixels.js";

/**
 * `bun run pair`, held to what the owner is sent: *before* is on the left or
 * on top, *after* beside or under it, the seam between them is the gutter's
 * grey, and neither picture is stretched to fit the other.
 */

/** A `w` by `h` RGB picture of one colour. */
function flat(w: number, h: number, rgb: readonly [number, number, number]): Picture {
  const pixels = new Uint8Array(w * h * 3);
  for (let i = 0; i < w * h; i++) pixels.set(rgb, i * 3);
  return { width: w, height: h, pixels };
}

function at(pic: Picture, x: number, y: number): number[] {
  const i = (y * pic.width + x) * 4;
  return [...pic.pixels.subarray(i, i + 4)];
}

const RED = [255, 0, 0] as const;
const BLUE = [0, 0, 255] as const;

describe("pair", () => {
  it("puts two portrait frames side by side, before on the left", () => {
    const out = pair(flat(2, 5, RED), flat(2, 5, BLUE), 1);
    expect([out.width, out.height]).toEqual([5, 5]);
    expect(at(out, 1, 2)).toEqual([255, 0, 0, 255]);
    expect(at(out, 2, 2)).toEqual([128, 128, 128, 255]);
    expect(at(out, 3, 2)).toEqual([0, 0, 255, 255]);
  });

  it("stacks two wide crops, before on top", () => {
    const out = pair(flat(6, 2, RED), flat(6, 2, BLUE), 2);
    expect([out.width, out.height]).toEqual([6, 6]);
    expect(at(out, 3, 1)).toEqual([255, 0, 0, 255]);
    expect(at(out, 3, 3)).toEqual([128, 128, 128, 255]);
    expect(at(out, 3, 4)).toEqual([0, 0, 255, 255]);
  });

  it("centres a smaller picture on the gutter's grey rather than stretching it", () => {
    const out = pair(flat(2, 4, RED), flat(2, 2, BLUE), 0, "beside");
    expect(at(out, 2, 0)).toEqual([128, 128, 128, 255]);
    expect(at(out, 2, 1)).toEqual([0, 0, 255, 255]);
    expect(at(out, 2, 3)).toEqual([128, 128, 128, 255]);
  });

  it("is told the direction outright when asked", () => {
    expect(directionFor(flat(6, 2, RED), flat(6, 2, BLUE))).toBe("stack");
    const out = pair(flat(6, 2, RED), flat(6, 2, BLUE), 0, "beside");
    expect([out.width, out.height]).toEqual([12, 2]);
  });

  it("writes a PNG the decoder reads back, whatever channels went in", () => {
    const rgba = toRgba(flat(1, 1, RED));
    const out = pair(flat(1, 3, BLUE), rgba, 1);
    const back = decodePng(encodePng(out, 4));
    expect(at(back, 0, 0)).toEqual([0, 0, 255, 255]);
    expect(at(back, 2, 1)).toEqual([255, 0, 0, 255]);
  });

  it("refuses a gutter that is not a whole number of pixels", () => {
    expect(() => pair(flat(1, 1, RED), flat(1, 1, BLUE), 1.5)).toThrow(/gutter/);
  });
});
