import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { strokeGlow } from "../src/glow.js";
import { PALETTE, STROKE } from "../src/palette.js";
import { drawHatch, hatchLids } from "../src/warden-eye.js";
import { installPixelGlobals } from "./pixel-harness.js";

/**
 * **The warden's two lids split out draw the same hatch**
 * (`docs/spec/living-bosses.md`, the part map). `drawHatch` as it was before
 * the split — both lids laid in its own loop — is kept here as the *before*,
 * and the hatch drawn from `hatchLids` is painted beside it into real pixels
 * shut, half and open, and held equal within 1 in 255.
 */

installPixelGlobals();
const SIZE = 160;
const R = 40;
const C = SIZE / 2;

/** The seam and the fold as they were, verbatim. */
const SEAM = 0.3;
const SEAM_AT = 0.45;
const FOLD = 0.38;
const FOLD_REACH = 0.7;
const seam = (x: number, cy: number, r: number): string =>
  `C ${x + r * SEAM} ${cy - r * SEAM_AT} ${x - r * SEAM} ${cy + r * SEAM_AT} ${x} ${cy + r}`;

/** The hatch before the split, verbatim. */
function before(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  openness: number,
): void {
  const slide = r * 1.15 * openness;
  ctx.save();
  ctx.fillStyle = PALETTE.rock;
  const folds = new Path2D();
  for (const side of [-1, 1] as const) {
    const x = cx + side * slide;
    const sweep = side === 1 ? 0 : 1;
    const lid = new Path2D(
      `M ${x} ${cy - r} ${seam(x, cy, r)} A ${r} ${r} 0 0 ${sweep} ${x} ${cy - r} Z`,
    );
    ctx.fill(lid);
    strokeGlow(ctx, lid, PALETTE.rockDark, STROKE.inner, 0.6);
    const fx = x + side * r * FOLD;
    folds.moveTo(fx, cy - r * FOLD_REACH);
    folds.bezierCurveTo(
      fx + r * SEAM * 0.7,
      cy - r * SEAM_AT * 0.7,
      fx - r * SEAM * 0.7,
      cy + r * SEAM_AT * 0.7,
      fx,
      cy + r * FOLD_REACH,
    );
  }
  ctx.globalAlpha = 0.45;
  ctx.strokeStyle = PALETTE.rockDark;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(folds);
  ctx.restore();
}

function paint(draw: (ctx: CanvasRenderingContext2D) => void): Uint8ClampedArray {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  draw(ctx);
  return ctx.getImageData(0, 0, SIZE, SIZE).data;
}

describe("the warden's hatch lids, split out", () => {
  for (const [name, openness] of [
    ["shut", 0],
    ["half", 0.5],
    ["open", 1],
    ["a little", 0.13],
  ] as const)
    it(`draws the same hatch ${name}`, () => {
      const a = paint((ctx) => before(ctx, C, C, R, openness));
      const b = paint((ctx) => drawHatch(ctx, C, C, R, openness));
      let worst = 0;
      for (let i = 0; i < a.length; i++)
        worst = Math.max(worst, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
      expect(worst).toBeLessThanOrEqual(1);
    });

  it("hangs each lid from a hinge on its outer rim, on the hole's middle line", () => {
    for (const openness of [0, 0.5, 1]) {
      const [left, right] = hatchLids(C, C, R, openness);
      expect(left?.side).toBe(-1);
      expect(right?.side).toBe(1);
      const slide = R * 1.15 * openness;
      expect(left?.hinge).toEqual({ x: C - slide - R, y: C });
      expect(right?.hinge).toEqual({ x: C + slide + R, y: C });
    }
  });
});
