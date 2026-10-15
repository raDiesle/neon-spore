import { describe, expect, test } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { clearBakedCaches } from "../src/baked.js";
import type { GlanceFrame } from "../src/glance.js";
import { drawGlancedLayer } from "../src/glance-layer.js";
import { installPixelGlobals } from "./pixel-harness.js";

/**
 * **A turned body is never cut at its sides.** The near half of a turned part
 * is opened, `glanceSqueeze` over 1, and a roll swings its corners out; both
 * carry the part past the square its layer was cut to. A slick turned at the
 * widest swing lost a sliver off its near side, the owner, 15 October 2026.
 */

const R = 20;
const REACH = 2;
const X = 100;
const Y = 100;

/** The columns, left to right, any pixel of `row` is painted in. */
function paintedSpan(ctx: CanvasRenderingContext2D, row: number): [number, number] {
  const { data } = ctx.getImageData(0, row, 200, 1);
  let lo = -1;
  let hi = -1;
  for (let x = 0; x < 200; x++) {
    if ((data[x * 4 + 3] ?? 0) > 0) {
      if (lo < 0) lo = x;
      hi = x;
    }
  }
  return [lo, hi];
}

/** A disc filling `REACH` radii, and a puff `above` radii over it, turned by `f`. */
function drawTurned(f: GlanceFrame, above = 0): CanvasRenderingContext2D {
  installPixelGlobals();
  clearBakedCaches();
  const ctx = createCanvas(200, 200).getContext("2d") as unknown as CanvasRenderingContext2D;
  const shade = { dark: 0, full: 0.22, reach: REACH, up: above + 0.5, atop: true };
  drawGlancedLayer(ctx, f, shade, (g) => {
    g.fillStyle = "#fff";
    g.beginPath();
    g.arc(X, Y, REACH * R - 1, 0, Math.PI * 2);
    g.arc(X, Y - above * R, R / 2, 0, Math.PI * 2);
    g.fill();
    return [];
  });
  return ctx;
}

describe("a turned body's layer", () => {
  for (const s of [-1, 1] as const) {
    test(`keeps the whole of its opened half, the ${s < 0 ? "left" : "right"}`, () => {
      // A swing toward one side opens the other (`glanceSqueeze`).
      const swing = 0.22 * R * -s;
      const ctx = drawTurned({ x: X, y: Y, r: R, hold: 0, swing, roll: 0 });
      const [lo, hi] = paintedSpan(ctx, Y);
      const near = (1 + 0.22) * (REACH * R - 1);
      // The opened half reaches past the unturned square of `REACH` radii.
      if (s < 0) expect(lo).toBeLessThanOrEqual(Math.ceil(X - near) + 1);
      else expect(hi).toBeGreaterThanOrEqual(Math.floor(X + near) - 1);
    });
  }

  for (const s of [-1, 1] as const) {
    test(`keeps the whole of its squeezed half, the ${s < 0 ? "left" : "right"}`, () => {
      // A swing toward one side squeezes that side, from the part drawn whole.
      const swing = 0.22 * R * s;
      const ctx = drawTurned({ x: X, y: Y, r: R, hold: 0, swing, roll: 0 });
      const [lo, hi] = paintedSpan(ctx, Y);
      const far = (1 - 0.22) * (REACH * R - 1);
      // Cut to the turned box alone, the layer held the far half only to the
      // squeeze of its reach, and the screen got the squeeze of that: 24 of 30.
      if (s < 0) expect(lo).toBeLessThanOrEqual(Math.ceil(X - far) + 1);
      else expect(hi).toBeGreaterThanOrEqual(Math.floor(X + far) - 1);
    });
  }

  test("keeps its corners when it rolls", () => {
    const ctx = drawTurned({ x: X, y: Y, r: R, hold: 0, swing: 0.22 * R, roll: 0.14 });
    // The disc's opened left half, rolled, still reaches well outside the square.
    const [lo] = paintedSpan(ctx, Y);
    expect(lo).toBeLessThan(X - REACH * R);
  });

  test("keeps what is drawn above its square, as far up as `up` says", () => {
    const ctx = drawTurned({ x: X, y: Y, r: R, hold: 0, swing: 0.22 * R, roll: 0 }, 3.5);
    // A living body's plume stands that far over it (`ownLightReach`).
    expect(paintedSpan(ctx, Y - 3.5 * R)[0]).toBeGreaterThan(0);
  });
});

describe("a nodding body's layer", () => {
  for (const s of [-1, 1] as const) {
    test(`keeps the whole of its opened half, the ${s < 0 ? "top" : "bottom"}`, () => {
      // A nod down opens the top, as a swing right opens the left.
      const nod = 0.22 * R * -s;
      const ctx = drawTurned({ x: X, y: Y, r: R, hold: 0, swing: 0, roll: 0, nod });
      const near = (1 + 0.22) * (REACH * R - 1);
      const row = s < 0 ? Math.ceil(Y - near) + 1 : Math.floor(Y + near) - 1;
      expect(paintedSpan(ctx, row)[0]).toBeGreaterThan(0);
      // And the closed half is closed: nothing as far out the other way.
      const shut = s < 0 ? Math.floor(Y + REACH * R - 4) : Math.ceil(Y - REACH * R + 4);
      expect(paintedSpan(ctx, shut)[0]).toBe(-1);
    });
  }

  test("is the across turn, seen a quarter round on", () => {
    const across = drawTurned({ x: X, y: Y, r: R, hold: 0, swing: 0.22 * R, roll: 0 });
    const left = paintedSpan(across, Y);
    const down = drawTurned({ x: X, y: Y, r: R, hold: 0, swing: 0, roll: 0, nod: 0.22 * R });
    const { data } = down.getImageData(X, 0, 1, 200);
    let top = -1;
    let bottom = -1;
    for (let y = 0; y < 200; y++) {
      if ((data[y * 4 + 3] ?? 0) > 0) {
        if (top < 0) top = y;
        bottom = y;
      }
    }
    expect(Math.abs(top - left[0])).toBeLessThanOrEqual(1);
    expect(Math.abs(bottom - left[1])).toBeLessThanOrEqual(1);
  });
});

describe("a layer after a bigger one", () => {
  /** A turned disc of `size` radii, alone on a canvas of its own. */
  function turnedDisc(size: number): Uint8ClampedArray {
    const ctx = createCanvas(200, 200).getContext("2d") as unknown as CanvasRenderingContext2D;
    const f = { x: X, y: Y, r: R, hold: 0, swing: 0.25 * R, roll: 0 };
    drawGlancedLayer(ctx, f, { dark: 0, full: 0.22, reach: size, atop: true }, (g) => {
      g.fillStyle = "#fff";
      g.beginPath();
      g.arc(X, Y, size * R - 1, 0, Math.PI * 2);
      g.fill();
      return [];
    });
    return ctx.getImageData(0, 0, 200, 200).data;
  }

  test("shows nothing the bigger one left on the scratch canvases", () => {
    installPixelGlobals();
    clearBakedCaches();
    // A reach off the pixel grid, as a body's light is: the box's edge then
    // falls inside a pixel the squeeze's filter reads across.
    const fresh = turnedDisc(1.23);
    turnedDisc(4);
    // The same small part, drawn on scratch a part bigger than it has used.
    const after = turnedDisc(1.23);
    expect(Buffer.from(after).equals(Buffer.from(fresh))).toBe(true);
  });
});
