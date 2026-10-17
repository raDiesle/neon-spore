import { describe, expect, test } from "bun:test";
import { fastSlides, PACE_FAR_COLS, paceBeats } from "../src/wave-pace.js";

const at = (beat: number, col: number) => ({ beat, col });

describe("fast slides", () => {
  test("a far column needs more beats: the slide, then the call", () => {
    expect(paceBeats(4)).toBe(4);
    expect(paceBeats(10)).toBe(7);
  });

  test("across the field in four beats is one, and the rest after it is read", () => {
    expect(fastSlides([at(0, 0), at(4, 10), at(12, 10)])).toEqual([
      { beat: 0, gap: 4, cols: 10, rest: 8 },
    ]);
  });

  test("waiting long enough, or staying near, is none", () => {
    expect(fastSlides([at(0, 0), at(7, 10)])).toEqual([]);
    expect(fastSlides([at(0, 5), at(1, 5 + PACE_FAR_COLS - 1)])).toEqual([]);
  });

  test("a twin is one moment, measured from whichever is nearest the next", () => {
    expect(fastSlides([at(0, 0), at(0, 10), at(4, 9)])).toEqual([]);
  });

  test("a seven-column wave is measured on the eleven-tile field", () => {
    expect(fastSlides([at(0, 0), at(4, 6)], 7)).toHaveLength(1);
  });
});
