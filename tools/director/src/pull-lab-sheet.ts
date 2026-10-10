import type { Variant } from "../../versus/variant.js";
import { text } from "./gestures-page.js";
import { autoThumb } from "./pull-lab-auto.js";
import { paintLab, pullLooks } from "./pull-lab-paint.js";
import { freshPull, type LabPull, lift, move, press, tick } from "./pull-lab-rule.js";
import { LAB_KNOB, type LabShape } from "./pull-lab-shapes.js";

/**
 * **EVERY LOOK, EVERY STATE** — the PULL LAB's comparison sheet: one row per
 * look (what ships, then each VERSUS candidate that patches the pull), one
 * column per moment of AUTO's loop. Each cell is the lab's own frame
 * (`paintLab`), run from a fresh pull at a fixed step to its moment, so the
 * sheet is the same every time it is drawn and a picture of it says what the
 * lab does — not a mock of it.
 */

/** The moments, in seconds of AUTO's loop (`pull-lab-auto.ts`), and what each shows. */
export const MOMENTS: readonly { at: number; label: string }[] = [
  { at: 0.55, label: "WAITING" },
  { at: 1.75, label: "HELD · HALF WAY" },
  { at: 2.6, label: "COUNTED" },
  { at: 5.3, label: "SHORT · HELD" },
  { at: 5.75, label: "SHORT · REFUSED" },
];

const STEP = 1 / 60;

/** The pull as AUTO leaves it `seconds` into its loop, short pulls refused. */
export function pullAt(shape: LabShape, seconds: number): { pull: LabPull; down: boolean } {
  const pull = freshPull(shape);
  let down = false;
  for (let t = 0; t < seconds; t += STEP) {
    const th = autoThumb(shape, t);
    if (th.down && !down) press(shape, pull, th.at);
    if (th.down) move(shape, pull, th.at);
    if (!th.down && down) lift(shape, pull, "refuse");
    down = th.down;
    tick(shape, pull, STEP);
  }
  return { pull, down };
}

/** The box round the shape's whole travel, with room for a knob's rings. */
function cropOf(shape: LabShape): { x: number; y: number; w: number; h: number } {
  const pad = LAB_KNOB * 3.4;
  const pts = shape.direction === "free" ? ropeReach(shape) : shape.track.pts;
  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const x = Math.min(...xs) - pad;
  const y = Math.min(...ys) - pad;
  return { x, y, w: Math.max(...xs) + pad - x, h: Math.max(...ys) + pad - y };
}

/** A rope can be carried any way: its reach is a circle round the bolt. */
function ropeReach(shape: LabShape) {
  const [a, b] = shape.track.pts;
  if (!a || !b) return shape.track.pts;
  const len = Math.hypot(b.x - a.x, b.y - a.y);
  return [
    { x: a.x - len, y: a.y - len },
    { x: a.x + len, y: a.y + len },
  ];
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
  const th = autoThumb(shape, seconds);
  paintLab(ctx, { shape, pull, look, time: seconds, thumb: { at: th.at, down } });
  return canvas;
}

/** The whole sheet for one shape, `cssW` wide per cell. */
export function labSheet(shape: LabShape, cssW = 150): HTMLElement {
  const looks: (Variant | null)[] = [null, ...pullLooks()];
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
