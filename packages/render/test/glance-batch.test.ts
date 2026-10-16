import { describe, expect, test } from "bun:test";
import { createCanvas } from "@napi-rs/canvas";
import { clearBakedCaches } from "../src/baked.js";
import type { GlanceFrame } from "../src/glance.js";
import { layGlancesAhead } from "../src/glance-batch.js";
import { drawGlancedLayer } from "../src/glance-layer.js";
import { installPixelGlobals } from "./pixel-harness.js";

/**
 * **A pass's turned parts laid down ahead are the parts laid down one by
 * one**, to within two steps (`glance-batch.ts`). Each is drawn the way a living
 * body is — an opaque under-fill, a translucent flesh over it and a stroke,
 * the layering whose seam the layer exists for — with a glow past its edge,
 * and the bodies overlap, so a cell placed out of order shows. Every turn the
 * layer takes: either swing, a roll, a nod; the far side darkened on the
 * layer (`atop`) and over the paths `draw` answers with; a part drawn faded.
 * Every cell sits on whole pixels, so the batch moves each part by whole
 * pixels and nothing else: a cell that bled is tens of steps, and all that is
 * allowed is the step or two a seam rounds by when its transform is composed
 * at another offset.
 */

const SIZE = 400;
const R = 18;

interface Part {
  f: GlanceFrame & { edge?: true; past?: true };
  atop: boolean;
  alpha: number;
}

const PARTS: Part[] = [
  { f: { x: 80, y: 90, r: R, hold: 0, swing: 0.2 * R, roll: 0 }, atop: true, alpha: 1 },
  { f: { x: 108, y: 100, r: R, hold: 0, swing: -0.2 * R, roll: 0.12 }, atop: true, alpha: 1 },
  {
    f: { x: 200, y: 96, r: R, hold: 0, swing: 0.15 * R, roll: -0.1, nod: 3 },
    atop: true,
    alpha: 1,
  },
  { f: { x: 300, y: 120, r: R, hold: 0, swing: -0.22 * R, roll: 0 }, atop: false, alpha: 1 },
  { f: { x: 120, y: 260, r: R, hold: 0.5, swing: 0.18 * R, roll: 0 }, atop: true, alpha: 0.6 },
  { f: { x: 140, y: 250, r: R, hold: 0, swing: -0.12 * R, roll: 0.2 }, atop: false, alpha: 1 },
  // One that draws past its reach, which the layer cuts at its box.
  {
    f: { x: 320, y: 300, r: R, hold: 0, swing: 0.22 * R, roll: 0, past: true },
    atop: true,
    alpha: 1,
  },
  // Against the canvas's edges, where the box is cut short and the halves'
  // clip reaches past it: on one shared atlas, into the cell beside it.
  {
    f: { x: 34, y: 30, r: R, hold: 0, swing: 0.22 * R, roll: 0.1, edge: true },
    atop: true,
    alpha: 1,
  },
  {
    f: { x: 392, y: 14, r: R, hold: 0, swing: -0.22 * R, roll: 0, edge: true },
    atop: false,
    alpha: 1,
  },
];

function body(g: CanvasRenderingContext2D, { x, y }: GlanceFrame): Path2D {
  const skin = new Path2D();
  skin.ellipse(x, y, R, R * 0.8, 0, 0, Math.PI * 2);
  g.fillStyle = "#14263a";
  g.fill(skin);
  g.fillStyle = "rgba(79, 216, 255, 0.55)";
  g.fill(skin);
  g.strokeStyle = "#e8f7ff";
  g.lineWidth = 2;
  g.stroke(skin);
  const glow = g.createRadialGradient(x, y - R, 0, x, y - R, R * 1.6);
  glow.addColorStop(0, "rgba(255, 120, 200, 0.5)");
  glow.addColorStop(1, "rgba(255, 120, 200, 0)");
  g.fillStyle = glow;
  g.fillRect(x - 2 * R, y - 3 * R, 4 * R, 3 * R);
  // A haze to the corners of its reach, as a lit body's plume and halo
  // reach: what a rolled half carries past its box is never nothing.
  g.fillStyle = "rgba(120, 80, 255, 0.12)";
  g.fillRect(x - 2 * R, y - 2.5 * R, 4 * R, 4.5 * R);
  return skin;
}

function pass(ctx: CanvasRenderingContext2D): void {
  for (const { f, atop, alpha } of PARTS) {
    ctx.save();
    ctx.globalAlpha = alpha;
    const shade = { dark: 0.6, full: 0.22, reach: 2, up: 2.5, atop };
    drawGlancedLayer(ctx, f, shade, (g) => {
      const skin = body(g, f);
      if (f.past) {
        g.fillStyle = "#ffd23f";
        g.fillRect(f.x - 6 * R, f.y - R, 4 * R, 2 * R);
      }
      return atop ? [] : [skin];
    });
    ctx.restore();
  }
}

function drawn(ahead: boolean): Buffer {
  const ctx = createCanvas(SIZE, SIZE).getContext("2d") as unknown as CanvasRenderingContext2D;
  ctx.fillStyle = "#0b0a24";
  ctx.fillRect(0, 0, SIZE, SIZE);
  if (ahead) layGlancesAhead(ctx, pass);
  else pass(ctx);
  return Buffer.from(ctx.getImageData(0, 0, SIZE, SIZE).data);
}

/** The canvas with nothing turned on it. */
function background(): Buffer {
  const c = createCanvas(SIZE, SIZE).getContext("2d");
  c.fillStyle = "#0b0a24";
  c.fillRect(0, 0, SIZE, SIZE);
  return Buffer.from(c.getImageData(0, 0, SIZE, SIZE).data);
}

/**
 * Whether a pixel is within a part the canvas's edge cuts. Its box is cut
 * there, and its halves read past the cut: the one-by-one layer's own edge
 * repeated, a cell's empty gutter — a rim a few steps apart on a body half
 * off the screen, and nowhere else.
 */
const cut = (x: number, y: number): boolean =>
  PARTS.some(({ f }) => f.edge === true && Math.hypot(x - f.x, y - f.y) < 3.2 * R);

describe("turned parts laid down ahead of their pass", () => {
  installPixelGlobals();

  test("are the parts laid down one by one, to within two steps, past the cut ones", () => {
    clearBakedCaches();
    const one = drawn(false);
    const ahead = drawn(true);
    let most = 0;
    for (let i = 0; i < one.length; i += 1) {
      const p = i >> 2;
      if (cut((p % SIZE) + 0.5, Math.floor(p / SIZE) + 0.5)) continue;
      const d = Math.abs((one[i] ?? 0) - (ahead[i] ?? 0));
      most = Math.max(most, d);
    }
    // Two steps on a seam, where the halves are added at half strength under
    // a transform composed at another offset and round the other way. A cell
    // that bled into its neighbour is tens of steps.
    expect(most).toBeLessThanOrEqual(2);
    expect(one.equals(background())).toBe(false);
  });

  test("a second pass ahead draws the same: nothing is left from the first", () => {
    clearBakedCaches();
    const first = drawn(true);
    expect(drawn(true).equals(first)).toBe(true);
  });
});
