import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { DEFAULT_CONFIG, type HiveState } from "@neon-spore/sim";
import { hiveBox, hiveLobes, hiveMassPath, hiveUnderY, lobeDepth } from "../src/hive-shape.js";
import { computeLayout, type Layout, tileCX } from "../src/layout.js";
import { installPixelGlobals, PIXEL_VIEWPORT } from "./pixel-harness.js";

/**
 * **THE HIVE's lobes split out draw the same mass** (`docs/spec/living-bosses.md`,
 * the part map). The contour as it was before the split — one loop laying the
 * scallops — is kept here as the *before*, and the mass built from
 * `hiveLobes` is filled beside it into real pixels at every count of sites,
 * closing and breathing, and held equal within 1 in 255.
 */

installPixelGlobals();
const cfg = DEFAULT_CONFIG;
const l = computeLayout(PIXEL_VIEWPORT, cfg, "p1");
const W = Math.ceil(l.width);
const H = Math.ceil(l.gridTop + l.tile);

/** The mass reads nothing of the state but its columns. */
const at = (cols: number[]): HiveState => ({ cols }) as unknown as HiveState;

/** The contour before the split, verbatim. */
function before(l: Layout, s: HiveState, open: number, time: number): Path2D {
  const box = hiveBox(l, cfg);
  const mid = (box.left + box.right) * 0.5;
  const hw = (box.right - box.left) * 0.5 * open;
  const top = box.top;
  const bottom = box.bottom;
  const flank = l.tile * (0.12 + 0.03 * Math.sin(time * 1.1));
  const dome = l.tile * 0.5;
  const lobe = lobeDepth(l);
  const p = new Path2D();
  p.moveTo(mid - hw, top + dome);
  p.quadraticCurveTo(mid, top - dome * 0.6, mid + hw, top + dome);
  p.quadraticCurveTo(mid + hw + flank, (top + bottom) * 0.5, mid + hw, bottom - lobe);
  const xs = [...s.cols].sort((a, b) => a - b).map((c) => mid + (tileCX(l, c) - mid) * open);
  for (let i = xs.length - 1; i >= 0; i--) {
    const cx = xs[i] ?? mid;
    const x0 = i > 0 ? (cx + (xs[i - 1] ?? mid)) * 0.5 : mid - hw;
    p.quadraticCurveTo(cx, bottom + lobe, x0, bottom - lobe);
  }
  if (xs.length === 0) p.lineTo(mid - hw, bottom - lobe);
  p.quadraticCurveTo(mid - hw - flank, (top + bottom) * 0.5, mid - hw, top + dome);
  p.closePath();
  return p;
}

/** A path filled translucent and stroked, as the drawer lays the wax. */
function paint(path: Path2D): Uint8ClampedArray {
  const canvas = createCanvas(W, H);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  ctx.fillStyle = "rgba(240, 180, 60, 0.6)";
  ctx.fill(path);
  ctx.strokeStyle = "rgb(255, 230, 160)";
  ctx.lineWidth = 2;
  ctx.stroke(path);
  return ctx.getImageData(0, 0, W, H).data;
}

const COLS = [4, 1, 7, 2, 6, 3, 5];
const CASES = [0, 1, 2, 4, COLS.length].flatMap((n) =>
  [1, 0.5, 0.1].flatMap((open) => [0, 1.3].map((time) => ({ cols: COLS.slice(0, n), open, time }))),
);

describe("THE HIVE's lobes, split out", () => {
  for (const c of CASES)
    it(`draws the same mass with ${c.cols.length} sites at ${c.open} open, ${c.time}s`, () => {
      const s = at(c.cols);
      const a = paint(before(l, s, c.open, c.time));
      const b = paint(hiveMassPath(l, cfg, s, c.open, c.time));
      let worst = 0;
      for (let i = 0; i < a.length; i++)
        worst = Math.max(worst, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
      expect(worst).toBeLessThanOrEqual(1);
    });

  it("hangs every lobe from a joint on the underside's line, over its own site", () => {
    const s = at(COLS);
    const lobes = hiveLobes(l, cfg, s, 1);
    expect(lobes.length).toBe(COLS.length);
    const line = hiveBox(l, cfg).bottom - lobeDepth(l);
    const sites = [...COLS].sort((a, b) => b - a).map((c) => tileCX(l, c));
    lobes.forEach((b, i) => {
      expect(b.joint.y).toBeCloseTo(line, 6);
      expect(b.joint.x).toBeCloseTo(sites[i] ?? 0, 6);
      expect(b.bend.y).toBeGreaterThan(b.joint.y);
      expect(b.joint.y).toBeLessThan(hiveUnderY(l) + l.tile);
    });
  });
});
