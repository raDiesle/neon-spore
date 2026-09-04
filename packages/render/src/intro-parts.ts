import { blobPath } from "@neon-spore/content";
import { PALETTE } from "./palette.js";

/**
 * The parts the intro's six pictures are built out of: a plate, a body, a
 * hull. Split from `intro-figure.ts` when that file went past the 250-line
 * limit, along the seam it already had — next door is what each page argues,
 * and this is the handful of shapes all six borrow from the game.
 *
 * They are deliberately not the field's own drawing code. `hull.ts` draws a
 * hull for a world at a layout; this draws the *idea* of one, inside a box, at
 * whatever size a page has room for. Sharing the first with the second would
 * mean handing a menu screen a `World` it has no business holding.
 */

export interface FigureBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rounded plate — a phone, a panel, a slab. Used by four of the six. */
export function plate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hex: string,
  fill = "rgba(10,8,22,.85)",
): void {
  const r = Math.min(w, h) * 0.14;
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  ctx.strokeStyle = hex;
  ctx.lineWidth = Math.max(1, Math.min(w, h) * 0.02);
  ctx.stroke();
}

/** A body of the kind that falls down a column, at a size and a colour. */
export function body(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
): void {
  const path = new Path2D(blobPath(cx, cy, r, r * 0.86, 3, 0.06, 0.02, 0, 1907, 36));
  ctx.fillStyle = hex;
  ctx.globalAlpha = 0.85;
  ctx.fill(path);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = Math.max(1, r * 0.1);
  ctx.stroke(path);
}

/** The hull, as the curve it is: a low arc with a swelling standing on it. */
export function hull(
  ctx: CanvasRenderingContext2D,
  b: FigureBox,
  lobeAt: number,
  hex: string,
): void {
  const y = b.y + b.h * 0.86;
  ctx.beginPath();
  ctx.moveTo(b.x, y + b.h * 0.05);
  ctx.quadraticCurveTo(b.x + b.w / 2, y - b.h * 0.06, b.x + b.w, y + b.h * 0.05);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = Math.max(1.5, b.h * 0.02);
  ctx.stroke();
  const r = b.h * 0.06;
  const cx = b.x + b.w * lobeAt;
  ctx.beginPath();
  ctx.ellipse(cx, y - r * 0.5, r, r * 0.9, 0, 0, Math.PI * 2);
  ctx.fillStyle = hex;
  ctx.fill();
}
