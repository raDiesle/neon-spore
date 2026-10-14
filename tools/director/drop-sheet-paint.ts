import { createCanvas, Path2D as SkiaPath } from "@napi-rs/canvas";
import type { Variant } from "../versus/variant.js";
import { type Box, cropOf, pullAt, SHEET_STRAY, waitAt } from "./src/pull-lab-moment.js";
import { labLooks, paintLab, pullDraws } from "./src/pull-lab-paint.js";
import { knobOf, type LabShape } from "./src/pull-lab-shapes.js";

/**
 * **The PULL LAB's own frames, painted through Skia into one PNG grid** — the
 * half of `drop-sheet.ts` a test can call. No browser and no page: `paintLab`
 * onto `@napi-rs/canvas`, the engine Chrome rasterises with, at whatever size
 * a look has to be judged at. One row per look, one column per moment.
 */

export type DropCrop = "knob" | "start" | "wide";

export interface DropSheetAsk {
  shape: LabShape;
  /** The moments, seconds of AUTO's loop — or since the drop came in, with `wait`. */
  at: readonly { at: number; label: string }[];
  /** AUTO off and no thumb: the drop left waiting. */
  wait: boolean;
  /** Round the knob where it is drawn, round the path's start, or the whole travel. */
  crop: DropCrop;
  /** A cell's width in pixels. */
  size: number;
  /** A row for each VERSUS look that patches the pull, under the shipped one. */
  looks: boolean;
}

/** The header band over the columns, and the label column left of the rows. */
export const HEAD = 26;
export const SIDE = 120;
/** A knob or start crop's side, in knob radii: room for its rings and its fizz. */
const CLOSE = 7;

const BACK = "#05070d";
const INK = "#c8d2e6";

/** Skia's `Path2D` where the lab's drawing reaches for the page's. */
function installSkia(): void {
  (globalThis as Record<string, unknown>).Path2D = SkiaPath;
}

function box(ask: DropSheetAsk, at: { x: number; y: number }): Box {
  if (ask.crop === "wide") return cropOf(ask.shape, SHEET_STRAY);
  const side = knobOf(ask.shape) * CLOSE;
  return { x: at.x - side / 2, y: at.y - side / 2, w: side, h: side };
}

/** The cell's height for a cell `size` wide. */
export function cellHeight(ask: DropSheetAsk): number {
  if (ask.crop !== "wide") return ask.size;
  const b = cropOf(ask.shape, SHEET_STRAY);
  return Math.round((ask.size * b.h) / b.w);
}

/** The sheet, as PNG bytes. */
export function dropSheet(ask: DropSheetAsk): Buffer {
  installSkia();
  const looks: (Variant | null)[] = ask.looks ? [null, ...labLooks()] : [null];
  const h = cellHeight(ask);
  const canvas = createCanvas(SIDE + ask.at.length * ask.size, HEAD + looks.length * h);
  const ctx = canvas.getContext("2d") as unknown as CanvasRenderingContext2D;
  ctx.fillStyle = BACK;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  ctx.fillStyle = INK;
  ctx.font = "bold 11px sans-serif";
  ctx.textBaseline = "middle";
  ask.at.forEach((m, i) => {
    ctx.fillText(m.label, SIDE + i * ask.size + 6, HEAD / 2, ask.size - 12);
  });
  looks.forEach((look, row) => {
    const y0 = HEAD + row * h;
    ctx.fillStyle = INK;
    ctx.fillText(look ? look.name.toUpperCase() : "AS SHIPPED", 6, y0 + h / 2, SIDE - 12);
    ask.at.forEach((m, col) => {
      const pull = ask.wait ? waitAt(ask.shape, m.at) : pullAt(ask.shape, m.at).pull;
      const frame = { shape: ask.shape, pull, look, time: m.at, stray: SHEET_STRAY };
      const start = ask.shape.track.pts[0] ?? { x: 0, y: 0 };
      const b = box(ask, ask.crop === "start" ? start : pullDraws(frame).at);
      const x0 = SIDE + col * ask.size;
      const k = ask.size / b.w;
      ctx.save();
      ctx.beginPath();
      ctx.rect(x0, y0, ask.size, h);
      ctx.clip();
      ctx.setTransform(k, 0, 0, k, x0 - b.x * k, y0 - b.y * k);
      paintLab(ctx, frame);
      ctx.restore();
    });
  });
  return canvas.toBuffer("image/png");
}
