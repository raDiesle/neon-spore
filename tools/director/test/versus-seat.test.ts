import { describe, expect, test } from "bun:test";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { absDiffHash, bandTopPx, touchFootprintHash } from "../src/versus-seat.js";

/**
 * `versus-seat.ts`'s pure arithmetic, exercised without a canvas — `bun
 * test` carries no real DOM (`demo-panel.test.ts` says so at length), so
 * these build synthetic pixel buffers by hand rather than rendering
 * anything, the same way `balance.test.ts` tests logic pulled out from under
 * `document.createElement`.
 *
 * The three things this lane's brief asks to be provable with numbers:
 *   1. `p1` and `p2` see the same band boundary, so the split point itself
 *      never becomes a second source of "seat difference".
 *   2. a translucent layer that lands on the same pixels regardless of seat,
 *      blended over two different backgrounds, reports the same footprint —
 *      the false second screen this lane removes.
 *   3. a layer that only exists on one seat's screen at all still reports a
 *      different footprint — the real second screen this lane must keep.
 */

const WIDTH = 4;
const ROWS = 6;
const BAND_TOP = 3;

/** A flat `WIDTH`x`ROWS` RGBA buffer, one colour everywhere. */
function solid(r: number, g: number, b: number, a = 255): Uint8ClampedArray {
  const buf = new Uint8ClampedArray(WIDTH * ROWS * 4);
  for (let i = 0; i < buf.length; i += 4) {
    buf[i] = r;
    buf[i + 1] = g;
    buf[i + 2] = b;
    buf[i + 3] = a;
  }
  return buf;
}

/** `base` with an opaque `[y0,y1)` band painted a fixed colour — stands in
 * for the control strip, which is always different between the two seats
 * regardless of any candidate. */
function withBand(base: Uint8ClampedArray, r: number, g: number, b: number): Uint8ClampedArray {
  const out = base.slice();
  for (let y = BAND_TOP; y < ROWS; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const p = (y * WIDTH + x) * 4;
      out[p] = r;
      out[p + 1] = g;
      out[p + 2] = b;
      out[p + 3] = 255;
    }
  }
  return out;
}

/** `base` with a translucent overlay blended over rows `[y0,y1)` of every
 * column — a role-blind alpha blend, like `cannon:shot`'s `streak` reaching
 * into the band. `alpha`/`v` never read which seat they are drawing onto. */
function withTranslucentOverlay(
  base: Uint8ClampedArray,
  y0: number,
  y1: number,
  alpha: number,
  v: [number, number, number],
): Uint8ClampedArray {
  const out = base.slice();
  for (let y = y0; y < y1; y++) {
    for (let x = 0; x < WIDTH; x++) {
      const p = (y * WIDTH + x) * 4;
      for (let c = 0; c < 3; c++) {
        out[p + c] = Math.round(alpha * (v[c] ?? 0) + (1 - alpha) * (base[p + c] ?? 0));
      }
    }
  }
  return out;
}

describe("bandTopPx", () => {
  test("p1 and p2 split the probe screen at the same row", () => {
    // `bandSoloPct` governs both solo seats alike — the whole reason the two
    // seats' stages are pixel-identical in extent, per the header.
    expect(bandTopPx(DEFAULT_CONFIG, "p1")).toBe(bandTopPx(DEFAULT_CONFIG, "p2"));
  });

  test("the band sits strictly inside the probe screen", () => {
    const top = bandTopPx(DEFAULT_CONFIG, "p1");
    expect(top).toBeGreaterThan(0);
    expect(top).toBeLessThan(820);
  });
});

describe("absDiffHash", () => {
  test("is the same hash for two identical buffers", () => {
    const a = solid(10, 20, 30);
    const b = solid(10, 20, 30);
    expect(absDiffHash(a, b, WIDTH, 0, ROWS)).toBe(absDiffHash(a, b, WIDTH, 0, ROWS));
  });

  test("changes when the buffers differ inside the compared rows", () => {
    const a = solid(10, 20, 30);
    const b = solid(11, 20, 30);
    expect(absDiffHash(a, b, WIDTH, 0, ROWS)).not.toBe(absDiffHash(a, a, WIDTH, 0, ROWS));
  });

  test("is blind to a difference that lies outside the compared rows", () => {
    const a = withBand(solid(10, 20, 30), 0, 0, 0);
    const b = withBand(solid(10, 20, 30), 255, 255, 255);
    // Same field rows, wildly different band rows: restricting to the field
    // rows must not see the band at all.
    expect(absDiffHash(a, b, WIDTH, 0, BAND_TOP)).toBe(absDiffHash(a, a, WIDTH, 0, BAND_TOP));
  });
});

describe("touchFootprintHash — the one line this lane overturns", () => {
  test("a role-blind translucent overlay over two different band backgrounds reports the same footprint", () => {
    // p1's and p2's band are genuinely different colours — the control panel,
    // which differs on every wave the game has ever drawn and has nothing to
    // do with any candidate.
    const currentP1 = withBand(solid(5, 5, 5), 200, 40, 40);
    const currentP2 = withBand(solid(5, 5, 5), 40, 40, 200);
    // The same patch, with the same alpha and colour, applied identically at
    // both seats — it never reads which seat it is drawing for.
    const candidateP1 = withTranslucentOverlay(currentP1, BAND_TOP, ROWS, 0.8, [255, 255, 0]);
    const candidateP2 = withTranslucentOverlay(currentP2, BAND_TOP, ROWS, 0.8, [255, 255, 0]);

    const footprintP1 = touchFootprintHash(currentP1, candidateP1, WIDTH, BAND_TOP, ROWS, 10);
    const footprintP2 = touchFootprintHash(currentP2, candidateP2, WIDTH, BAND_TOP, ROWS, 10);
    // The exact-value hash is what used to report this as a real difference —
    // it is not blind to the differing background, on purpose, so this test
    // documents the failure the footprint hash exists to fix.
    const exactP1 = absDiffHash(currentP1, candidateP1, WIDTH, BAND_TOP, ROWS);
    const exactP2 = absDiffHash(currentP2, candidateP2, WIDTH, BAND_TOP, ROWS);
    expect(exactP1).not.toBe(exactP2);

    expect(footprintP1).toBe(footprintP2);
  });

  test("a patch that only one seat's screen ever draws at all still reports a different footprint", () => {
    // Both seats start from the same band content here — the point is not
    // the background, it is that the candidate's own content only exists on
    // one of the two screens, the way a cannon lobe never appears on p2's.
    const current = withBand(solid(5, 5, 5), 40, 40, 40);
    const candidateP1 = withBand(solid(5, 5, 5), 220, 220, 40); // p1 draws a lobe here
    const candidateP2 = withBand(solid(5, 5, 5), 40, 40, 40); // p2 draws nothing new

    const footprintP1 = touchFootprintHash(current, candidateP1, WIDTH, BAND_TOP, ROWS, 10);
    const footprintP2 = touchFootprintHash(current, candidateP2, WIDTH, BAND_TOP, ROWS, 10);
    expect(footprintP1).not.toBe(footprintP2);
  });

  test("rounding noise from an alpha blend near the threshold does not by itself flip the footprint", () => {
    const currentP1 = withBand(solid(0, 0, 0), 100, 100, 100);
    const currentP2 = withBand(solid(0, 0, 0), 102, 102, 102);
    // A whisper-thin overlay, well under the threshold on either background.
    const candidateP1 = withTranslucentOverlay(currentP1, BAND_TOP, ROWS, 0.02, [255, 255, 255]);
    const candidateP2 = withTranslucentOverlay(currentP2, BAND_TOP, ROWS, 0.02, [255, 255, 255]);
    const footprintP1 = touchFootprintHash(currentP1, candidateP1, WIDTH, BAND_TOP, ROWS, 10);
    const footprintP2 = touchFootprintHash(currentP2, candidateP2, WIDTH, BAND_TOP, ROWS, 10);
    expect(footprintP1).toBe(footprintP2);
  });
});
