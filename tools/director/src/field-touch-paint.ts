import { patches, type TouchArea } from "./field-focus.js";

/**
 * **Where a control answers a finger, drawn over the picture of it** — the
 * cells the sweep found (`field-focus.ts`) filled faintly, their outer edge
 * outlined, and each separate patch labelled with its size. The owner, 9
 * October 2026, deciding one look per control: how big the target is beside
 * how big it is drawn.
 *
 * Sizes are in the phone's CSS pixels, which on a phone are Apple's points
 * and Android's dp; `LEAST_TARGET` is the size both platforms' guidelines
 * ask a touch target to be at the least, and a patch narrower than it is
 * labelled red.
 */

export const LEAST_TARGET = 44;

const FILL = "rgba(47, 224, 240, 0.16)";
const EDGE = "#2fe0f0";
const SMALL = "#ff5470";

/** Where the picture is: device pixels per layout pixel, and the layout
 * point at the picture's top left. `ui` is device pixels per CSS pixel of the
 * picture, for line widths and type. */
export interface Placing {
  k: number;
  ox: number;
  oy: number;
  ui: number;
}

/** A patch's size as the card and the label say it: `46 × 52 pt`. */
export function patchSize(r: { w: number; h: number }): string {
  return `${Math.round(r.w)} × ${Math.round(r.h)} pt`;
}

/** The narrowest side of an area's narrowest patch, or null when it has none. */
export function narrowest(area: TouchArea): number | null {
  const sides = patches(area).map((p) => Math.min(p.w, p.h));
  return sides.length > 0 ? Math.min(...sides) : null;
}

export function paintTouchArea(
  ctx: CanvasRenderingContext2D,
  area: TouchArea,
  { k, ox, oy, ui }: Placing,
): void {
  const { step, cells } = area;
  const h = step / 2;
  const at = (x: number, y: number): [number, number] => [(x - ox) * k, (y - oy) * k];
  const has = new Set(cells.map((c) => `${Math.round(c.x / step)},${Math.round(c.y / step)}`));
  const on = (x: number, y: number): boolean =>
    has.has(`${Math.round(x / step)},${Math.round(y / step)}`);
  ctx.save();
  ctx.fillStyle = FILL;
  for (const c of cells) {
    const [x, y] = at(c.x - h, c.y - h);
    ctx.fillRect(x, y, step * k, step * k);
  }
  // The outline is every side of a cell with no cell beyond it.
  ctx.strokeStyle = EDGE;
  ctx.lineWidth = 1.5 * ui;
  ctx.beginPath();
  for (const c of cells) {
    const sides: [boolean, number, number, number, number][] = [
      [on(c.x, c.y - step), -h, -h, h, -h],
      [on(c.x, c.y + step), -h, h, h, h],
      [on(c.x - step, c.y), -h, -h, -h, h],
      [on(c.x + step, c.y), h, -h, h, h],
    ];
    for (const [shut, ax, ay, bx, by] of sides) {
      if (shut) continue;
      ctx.moveTo(...at(c.x + ax, c.y + ay));
      ctx.lineTo(...at(c.x + bx, c.y + by));
    }
  }
  ctx.stroke();
  ctx.font = `${11 * ui}px "Courier New", monospace`;
  ctx.textBaseline = "bottom";
  for (const p of patches(area)) {
    const label = patchSize(p);
    const [x, y] = at(p.x, p.y);
    const w = ctx.measureText(label).width;
    ctx.fillStyle = "rgba(0, 0, 0, 0.75)";
    ctx.fillRect(x, y - 14 * ui, w + 6 * ui, 14 * ui);
    ctx.fillStyle = Math.min(p.w, p.h) < LEAST_TARGET ? SMALL : EDGE;
    ctx.fillText(label, x + 3 * ui, y - 2 * ui);
  }
  ctx.restore();
}
