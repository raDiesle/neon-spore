import type { Variant } from "../../versus/variant.js";
import { text } from "./gestures-page.js";
import { autoThumb } from "./pull-lab-auto.js";
import { labLooks, paintLab } from "./pull-lab-paint.js";
import { freshPull, type LabPull, lift, move, press, type Stray, tick } from "./pull-lab-rule.js";
import { LAB_KNOB, LAB_TILE, type LabShape } from "./pull-lab-shapes.js";

/**
 * **EVERY LOOK, EVERY STATE** — the PULL LAB's comparison sheet: one row per
 * look (what ships, then each VERSUS candidate that patches the pull), one
 * column per moment of AUTO's loop. Each cell is the lab's own frame
 * (`paintLab`), run from a fresh pull at a fixed step to its moment, so the
 * sheet is the same every time it is drawn and a picture of it says what the
 * lab does — not a mock of it.
 */

/** The moments, in seconds of AUTO's loop (`pull-lab-auto.ts`), and what each shows —
 * with the sheet's OFF PATH rule on, so its second pull strays (`SHEET_STRAY`). */
export const MOMENTS: readonly { at: number; label: string }[] = [
  { at: 0.55, label: "WAITING" },
  { at: 1.6, label: "HELD · OFF THE MIDDLE" },
  { at: 2.17, label: "COUNTED · IT FALLS" },
  { at: 2.42, label: "COUNTED · SPLASH" },
  { at: 3.8, label: "A FRESH DROP" },
  { at: 5.1, label: "NEAR THE EDGE" },
  { at: 5.3, label: "OFF THE PATH" },
  { at: 6.3, label: "GOING HOME" },
];

const STEP = 1 / 60;
/** The sheet's OFF PATH rule: one tile, so its second pull strays and the band is drawn. */
export const SHEET_STRAY: Stray = "tile";

/** The pull as AUTO leaves it `seconds` into its loop, short pulls refused. */
export function pullAt(
  shape: LabShape,
  seconds: number,
  stray: Stray = SHEET_STRAY,
): { pull: LabPull; down: boolean } {
  const pull = freshPull(shape);
  let down = false;
  for (let t = 0; t < seconds; t += STEP) {
    const th = autoThumb(shape, t, stray !== "free");
    if (th.down && !down) press(shape, pull, th.at);
    if (th.down) move(shape, pull, th.at, stray);
    if (!th.down && down) lift(shape, pull, "refuse");
    down = th.down;
    tick(shape, pull, STEP);
  }
  return { pull, down };
}

/** The box round the shape's whole travel, with room for a knob's rings. */
function cropOf(shape: LabShape): { x: number; y: number; w: number; h: number } {
  // Room for a knob's rings, and for one let go a tile and more off the path.
  const pad = LAB_KNOB * 3.4 + (SHEET_STRAY === "free" ? 0 : LAB_TILE);
  const pts = shape.track.pts;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}

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
  const { pull, down } = pullAt(shape, seconds);
  const th = autoThumb(shape, seconds, SHEET_STRAY !== "free");
  paintLab(ctx, {
    shape,
    pull,
    look,
    time: seconds,
    thumb: { at: th.at, down },
    stray: SHEET_STRAY,
  });
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
