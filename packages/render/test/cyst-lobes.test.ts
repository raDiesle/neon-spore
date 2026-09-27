import { describe, expect, it } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { DEFAULT_CONFIG } from "@neon-spore/sim";
import { type CystPose, cystLobes, cystRadius, cystSacPath, RESTING } from "../src/cyst-shape.js";
import { computeLayout, type Layout } from "../src/layout.js";
import { splinePath } from "../src/spline.js";
import { installPixelGlobals, PIXEL_VIEWPORT } from "./pixel-harness.js";

/**
 * **THE CYST's lobes split out draw the same sac** (`docs/spec/living-bosses.md`,
 * the part map). The outline as it was before the split — one ring of samples
 * from the right lobe's tip — is kept here as the *before*, and the sac laid
 * from `cystLobes` is filled beside it into real pixels at rest, pinched,
 * shaking, swelling and spitting, and held equal within 1 in 255.
 */

installPixelGlobals();
const l = computeLayout(PIXEL_VIEWPORT, DEFAULT_CONFIG, "p1");
const SIZE = Math.ceil(l.tile * 7);

/** The outline before the split, verbatim. */
function before(l: Layout, pose: CystPose): Path2D {
  const pts: { x: number; y: number }[] = [];
  for (let i = 0; i < 72; i++) {
    const a = (i * Math.PI * 2) / 72;
    const r = cystRadius(l, a, pose);
    pts.push({ x: Math.cos(a) * r, y: Math.sin(a) * r });
  }
  return splinePath(pts, true);
}

/** A path filled and stroked round the canvas's middle, as the drawer lays the sac. */
function paint(path: Path2D): Uint8ClampedArray {
  const canvas = createCanvas(SIZE, SIZE);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  ctx.translate(SIZE / 2, SIZE / 2);
  ctx.fillStyle = "rgba(180, 120, 170, 0.95)";
  ctx.fill(path);
  ctx.strokeStyle = "rgb(90, 40, 80)";
  ctx.lineWidth = 3;
  ctx.stroke(path);
  return ctx.getImageData(0, 0, SIZE, SIZE).data;
}

const POSES: [string, CystPose][] = [
  ["resting", RESTING],
  ["breathing", { ...RESTING, time: 2.3 }],
  ["the left flank pinched", { ...RESTING, pinch: [1, 0], time: 0.7 }],
  ["the right flank half pinched", { ...RESTING, pinch: [0, 0.5], time: 1.1 }],
  ["both flanks shaking", { ...RESTING, shake: [0.08, -0.06], time: 3.9 }],
  ["swelling", { ...RESTING, swell: 1, pinch: [0.4, 0.4], time: 5 }],
  ["spitting", { ...RESTING, bulge: 1, time: 0.2 }],
];

describe("THE CYST's lobes, split out", () => {
  for (const [name, pose] of POSES)
    it(`draws the same sac ${name}`, () => {
      const a = paint(before(l, pose));
      const b = paint(cystSacPath(l, pose));
      let worst = 0;
      for (let i = 0; i < a.length; i++)
        worst = Math.max(worst, Math.abs((a[i] ?? 0) - (b[i] ?? 0)));
      expect(worst).toBeLessThanOrEqual(1);
    });

  it("hangs each of the four lobes from a joint on its own axis, inside its tip", () => {
    for (const [, pose] of POSES) {
      const lobes = cystLobes(l, pose);
      expect(lobes.map((b) => b.at)).toEqual([0, Math.PI / 2, Math.PI, (Math.PI * 3) / 2]);
      for (const b of lobes) {
        const reach = Math.hypot(b.joint.x, b.joint.y);
        expect(Math.atan2(b.joint.y, b.joint.x)).toBeCloseTo(
          Math.atan2(Math.sin(b.at), Math.cos(b.at)),
          6,
        );
        expect(reach).toBeLessThan(cystRadius(l, b.at, pose));
        expect(b.points.length).toBe(18);
      }
    }
  });
});
