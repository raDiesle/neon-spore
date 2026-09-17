import { createCanvas, Path2D as SkiaPath } from "@napi-rs/canvas";
import { ticksPerBeat, type World } from "@neon-spore/sim";
import { clearBakedCaches } from "../src/baked.js";
import { Canvas2DRenderer } from "../src/canvas2d.js";
import type { ViewRole } from "../src/layout.js";
import type { Viewport } from "../src/renderer.js";

/**
 * A frame drawn into real pixels, in-process, with no browser.
 *
 * `frame-harness.ts` draws through a stub that refuses what a canvas refuses
 * and records what it was asked; this draws through Skia (`@napi-rs/canvas`,
 * the same engine Chrome rasterises with) and hands back the picture. The two
 * answer different questions. The stub says whether every call was *legal*;
 * this says whether anything came of it — a body at `globalAlpha` 0, a glow
 * under the backdrop, a shape outside its clip, all legal and all invisible,
 * are only ever caught here. The owner chose to have it on 17 September 2026
 * against 27 MB of native code in every worktree (`docs/queue.md`, the
 * pixel-harness entry, has the figures).
 *
 * **A picture, not a screenshot.** `tools/frames` photographs the running
 * app, HUD buttons and all; this is the renderer alone on a bare canvas, so
 * nothing DOM is in it. `Picture` is the shape `tools/frames/pixels.ts` decodes
 * a screenshot into — row-major RGBA, filters undone — so a region check
 * written against one serves the other.
 *
 * **Small on purpose.** `VIEWPORT` in the frame harness is a phone at dpr 2,
 * six million pixels a frame; that is right for op counts, which do not scale
 * with pixels, and wrong here, where every pixel is filled. A phone at dpr 1
 * is a third of a million and draws in single-digit milliseconds, and a body
 * still covers a window of hundreds.
 *
 * **Text never reaches an assertion.** Skia here has whatever fonts the
 * machine has, which on a bare Linux box is none, so a glyph's pixels are the
 * one thing two machines would disagree about. Compare regions around bodies,
 * never around words.
 */

export interface Picture {
  width: number;
  height: number;
  /** Row-major RGBA, four bytes a pixel. */
  pixels: Uint8Array;
}

/** A phone at dpr 1: the layout the field is designed for, at a third of a
 * million pixels rather than six. */
export const PIXEL_VIEWPORT: Viewport = { width: 390, height: 844, dpr: 1 };

/**
 * A canvas the renderer can hold: Skia's, with the `style` a DOM element
 * has and `resize` writes to. Width and height are settable on Skia's own.
 */
function skiaCanvas(width = 1, height = 1): HTMLCanvasElement {
  const c = createCanvas(width, height) as unknown as { style: Record<string, string> };
  c.style = {};
  return c as unknown as HTMLCanvasElement;
}

/**
 * Installs `document` and `Path2D` from Skia rather than from the stub, and
 * empties every sprite cache — a sprite baked on a stub canvas cannot be
 * blitted onto a real one, and one baked here must not reach the next file's
 * stub. The mirror of `installCanvasGlobals`; a file calls one or the other.
 */
export function installPixelGlobals(): void {
  clearBakedCaches();
  const g = globalThis as Record<string, unknown>;
  g.Path2D = SkiaPath;
  g.document = {
    createElement: (tag: string) => {
      if (tag !== "canvas") throw new Error(`unexpected createElement(${tag})`);
      return skiaCanvas();
    },
  };
}

export interface PixelFrame {
  picture: Picture;
  /** The phase the frame was drawn at, for a caller placing a body by it. */
  beatPhase: number;
}

/**
 * One frame of `world`, as `role` sees it, at the world's own tick.
 *
 * A fresh renderer each time, so nothing one frame leaves in `Effects`
 * reaches the next: two calls with the same world are the same picture, which
 * is what lets `withoutBodies` be compared against the full frame at all.
 * Render has no `Math.random` (`src/hash.ts`), so that holds.
 */
export function drawPixels(
  world: World,
  role: ViewRole,
  viewport: Viewport = PIXEL_VIEWPORT,
): PixelFrame {
  const canvas = skiaCanvas();
  const renderer = new Canvas2DRenderer(canvas, { readback: true });
  renderer.resize(viewport);
  const tpb = ticksPerBeat(world.cfg);
  const beatPhase = (world.tick % tpb) / tpb;
  renderer.draw({
    world,
    beatPhase,
    role,
    time: world.tick / world.cfg.tickHz,
    dt: 1 / world.cfg.tickHz,
    events: [],
    running: true,
  });
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("no context on the Skia canvas");
  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
  return {
    picture: { width: canvas.width, height: canvas.height, pixels: new Uint8Array(data.buffer) },
    beatPhase,
  };
}

/**
 * The same world with nothing on the field that is drawn as a body — the
 * picture a body is told from. A shallow copy: the renderer reads `creatures`
 * and `pods` off the world it is handed and writes nothing back.
 */
export function withoutBodies(world: World): World {
  return { ...world, creatures: [], pods: [] };
}

/** The RGBA of one pixel, in the viewport's own units. */
export function pixelAt(p: Picture, x: number, y: number): [number, number, number, number] {
  const i = (Math.round(y) * p.width + Math.round(x)) * 4;
  const d = p.pixels;
  return [d[i] ?? 0, d[i + 1] ?? 0, d[i + 2] ?? 0, d[i + 3] ?? 0];
}

/**
 * Whether two pictures of the same size differ inside a square window —
 * `radius` each way from `(x, y)`, clipped to the picture — by more than a
 * rounding error in any channel of any pixel. A body that changed one pixel
 * has still been drawn; what this refuses is a window nothing touched.
 */
export function windowDiffers(
  a: Picture,
  b: Picture,
  x: number,
  y: number,
  radius: number,
  tolerance = 8,
): boolean {
  if (a.width !== b.width || a.height !== b.height) {
    throw new Error(`pictures differ in size: ${a.width}×${a.height} vs ${b.width}×${b.height}`);
  }
  const x0 = Math.max(0, Math.floor(x - radius));
  const x1 = Math.min(a.width - 1, Math.ceil(x + radius));
  const y0 = Math.max(0, Math.floor(y - radius));
  const y1 = Math.min(a.height - 1, Math.ceil(y + radius));
  for (let py = y0; py <= y1; py++) {
    let i = (py * a.width + x0) * 4;
    for (let px = x0; px <= x1; px++, i += 4) {
      for (let ch = 0; ch < 4; ch++) {
        if (Math.abs((a.pixels[i + ch] ?? 0) - (b.pixels[i + ch] ?? 0)) > tolerance) return true;
      }
    }
  }
  return false;
}
