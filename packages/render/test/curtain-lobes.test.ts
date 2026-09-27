import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { CURTAIN_COLS, DEFAULT_CONFIG } from "@neon-spore/sim";
import { CURTAIN_HEM_DROP, curtainHem, curtainSheetPath } from "../src/curtain-hem.js";
import { computeLayout, type Layout } from "../src/layout.js";
import { installPixelGlobals, PIXEL_VIEWPORT } from "./pixel-harness.js";

/**
 * **THE CURTAIN's hem split out draws the same membrane**
 * (`docs/spec/living-bosses.md`, the part map). The outline as it was before
 * the split — the hem laid in `drawCurtainSheet`'s own loop — is kept here as
 * the *before*, and the sheet built from `curtainHem` is filled beside it
 * into real pixels with every lobe on and some off, trailing, gathered and
 * swaying, and held equal within 1 in 255.
 */

installPixelGlobals();
const l = computeLayout(PIXEL_VIEWPORT, DEFAULT_CONFIG, "p1");
const W = Math.ceil(l.width);
const H = Math.ceil(l.tile * 3);
const X0 = (l.width - CURTAIN_COLS * l.tile) / 2;
const CY = l.tile * 1.5;

/** The membrane before the split, verbatim. */
function before(
  l: Layout,
  x0: number,
  cy: number,
  lobes: readonly boolean[],
  lag: number,
  lift: number,
  time: number,
): Path2D {
  const t = l.tile;
  const railY = cy - t * 0.5;
  const hemY = cy + t * 0.42 - lift;
  const x1 = x0 + CURTAIN_COLS * t;
  const path = new Path2D();
  path.moveTo(x0, railY);
  path.lineTo(x1, railY);
  const hemAt = (i: number): number =>
    hemY - ((lobes[i] ?? false) ? 0 : t * 0.16) + Math.sin(time * 1.7 + i) * t * 0.02;
  path.lineTo(x1 + lag, hemAt(CURTAIN_COLS - 1));
  for (let i = CURTAIN_COLS - 1; i >= 0; i--) {
    const y = hemAt(i);
    const xr = x0 + (i + 1) * t + lag;
    const xl = x0 + i * t + lag;
    path.quadraticCurveTo((xl + xr) / 2, y + t * 0.12, xl, y);
  }
  path.closePath();
  return path;
}

/** A path filled translucent and stroked, as the fabric is laid. */
function paint(path: Path2D): Uint8ClampedArray {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  ctx.fillStyle = "rgba(150, 110, 220, 0.45)";
  ctx.fill(path);
  ctx.strokeStyle = "rgb(210, 190, 255)";
  ctx.lineWidth = 2;
  ctx.stroke(path);
  return ctx.getImageData(0, 0, W, H).data;
}

const ALL = Array.from({ length: CURTAIN_COLS }, () => true);
const SOME = ALL.map((_, i) => i % 2 === 0);
const NONE = ALL.map(() => false);
const CASES = [
  { name: "whole", lobes: ALL, lag: 0, lift: 0, time: 0 },
  { name: "half its lobes gone, swaying", lobes: SOME, lag: 0, lift: 0, time: 1.9 },
  { name: "trailing a shove", lobes: ALL, lag: l.tile * 0.6, lift: 0, time: 0.4 },
  { name: "trailing the other way", lobes: SOME, lag: -l.tile * 0.4, lift: 0, time: 2.6 },
  { name: "gathered off the floor", lobes: ALL, lag: 0, lift: l.tile * 0.5, time: 3.3 },
  { name: "torn bare", lobes: NONE, lag: l.tile * 0.2, lift: 0, time: 4.1 },
];

describe("THE CURTAIN's hem, split out", () => {
  for (const c of CASES)
    it(`draws the same membrane ${c.name}`, () => {
      const a = paint(before(l, X0, CY, c.lobes, c.lag, c.lift, c.time));
      const b = paint(curtainSheetPath(l, X0, CY, c.lobes, c.lag, c.lift, c.time));
      let worst = 0;
      for (let i = 0; i < a.length; i++)
        worst = Math.max(worst, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
      expect(worst).toBeLessThanOrEqual(1);
    });

  it("hangs each scallop from a joint on the hem, over its own column", () => {
    const hem = curtainHem(l, X0, CY, ALL, 0, 0, 0);
    expect(hem.length).toBe(CURTAIN_COLS);
    hem.forEach((b, k) => {
      const col = CURTAIN_COLS - 1 - k;
      expect(b.joint.x).toBeCloseTo(X0 + (col + 0.5) * l.tile, 6);
      expect(Math.abs(b.joint.y - (CY + l.tile * CURTAIN_HEM_DROP))).toBeLessThan(l.tile * 0.03);
      expect(b.bend.y).toBeGreaterThan(b.joint.y);
    });
  });
});
