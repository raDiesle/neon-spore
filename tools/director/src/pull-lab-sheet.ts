import type { Variant } from "../../versus/variant.js";
import { text } from "./gestures-page.js";
import { cropOf, MOMENTS, pullAt, SHEET_STRAY } from "./pull-lab-moment.js";
import { labLooks, paintLab } from "./pull-lab-paint.js";
import type { LabShape } from "./pull-lab-shapes.js";

/**
 * **EVERY LOOK, EVERY STATE** — the PULL LAB's comparison sheet: one row per
 * look (what ships, then each VERSUS candidate that patches the pull), one
 * column per moment of AUTO's loop. Each cell is the lab's own frame
 * (`paintLab`), run from a fresh pull at a fixed step to its moment, so the
 * sheet is the same every time it is drawn and a picture of it says what the
 * lab does — not a mock of it.
 */

function cell(
  shape: LabShape,
  look: Variant | null,
  seconds: number,
  cssW: number,
): HTMLCanvasElement {
  const crop = cropOf(shape);
  const s = cssW / crop.w;
  const dpr = Math.min(4, 2 * (window.devicePixelRatio || 1));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(crop.w * s * dpr);
  canvas.height = Math.round(crop.h * s * dpr);
  canvas.style.width = `${crop.w * s}px`;
  canvas.style.height = `${crop.h * s}px`;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;
  const k = s * dpr;
  ctx.setTransform(k, 0, 0, k, -crop.x * k, -crop.y * k);
  const { pull } = pullAt(shape, seconds);
  paintLab(ctx, { shape, pull, look, time: seconds, stray: SHEET_STRAY });
  return canvas;
}

/** The whole sheet for one shape, `cssW` wide per cell. */
export function labSheet(shape: LabShape, cssW = 150): HTMLElement {
  const looks: (Variant | null)[] = [null, ...labLooks()];
  const grid = document.createElement("div");
  grid.className = "pull-lab-sheet";
  grid.style.gridTemplateColumns = `auto repeat(${MOMENTS.length}, ${cssW}px)`;
  grid.appendChild(text("span", shape.label, "pull-lab-sheet-corner"));
  for (const m of MOMENTS) grid.appendChild(text("span", m.label, "pull-lab-sheet-head"));
  for (const look of looks) {
    grid.appendChild(
      text("span", look ? look.name.toUpperCase() : "AS SHIPPED", "pull-lab-sheet-look"),
    );
    for (const m of MOMENTS) grid.appendChild(cell(shape, look, m.at, cssW));
  }
  return grid;
}
