import { describe, expect, test } from "bun:test";
import { signature } from "../src/versus-diff.js";

/**
 * TWO SHAPES IN ONE RECTANGLE ARE TWO SEATS.
 *
 * `sinew:band · white` draws a white block on the pilot's screen and a white
 * fill on the navigator's, in the same collar, and on 7 October 2026 it was
 * photographed as one seat. The suspicion was that `signature` hashes the
 * difference too coarsely to tell two shapes in one place apart; it does not,
 * and this holds that. What lost the second seat was `bun run versus:shot`
 * photographing the first `.versus-stage` (`tools/frames/versus-element.ts`).
 */

const W = 6;
const H = 10;
/** The field is every row above this; the collar sits in it. */
const BAND_TOP = 8;

function dark(): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(W * H * 4);
  for (let i = 3; i < buf.length; i += 4) buf[i] = 255;
  return buf;
}

/** `base` with rows `[y0, y1)` of columns 1..4 — the collar — painted white. */
function white(base: Uint8ClampedArray, y0: number, y1: number): Uint8ClampedArray {
  const out = base.slice();
  for (let y = y0; y < y1; y++)
    for (let x = 1; x < 5; x++) out.fill(255, (y * W + x) * 4, (y * W + x) * 4 + 3);
  return out;
}

describe("a patch drawing a different shape on each seat, in one rectangle", () => {
  test("signs the two seats differently", () => {
    const shipped = dark();
    // The pilot's block in the middle of the collar; the navigator's fill
    // from the collar's foot up. Same rectangle, same colour.
    const block = signature(shipped, white(shipped, 3, 5), W, H, BAND_TOP);
    const fill = signature(shipped, white(shipped, 4, 7), W, H, BAND_TOP);
    expect(block).not.toBe(fill);
  });
});
