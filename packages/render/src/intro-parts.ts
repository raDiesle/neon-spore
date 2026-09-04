import { blobPath } from "@neon-spore/content";
import { halo, strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { drawNavFeeder } from "./nav-button.js";
import { PALETTE } from "./palette.js";

/**
 * The parts the intro's six pictures are built out of: a plate, a blob, a
 * hull, a drip.
 *
 * They are the game's own idiom rather than a menu's — a dark fill, a neon rim
 * with `strokeGlow` behind it, a contour that wobbles because `blobPath` is
 * given the clock. The owner asked for exactly that when the first version
 * came back flat: *colours should look neon slimy fluid cool and
 * funny/friendly*. Nothing here is a rectangle if it can help it, and nothing
 * holds still.
 *
 * Deliberately not the field's own drawing code. `hull.ts` draws a hull for a
 * world at a layout; this draws the *idea* of one, inside a box, at whatever
 * size a page has room for. Sharing the first with the second would mean
 * handing a menu screen a `World` it has no business holding.
 */

export interface FigureBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** A rounded plate — a phone, a panel, a slab — with the light coming off it. */
export function plate(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  hex: string,
  fill = "rgba(10,8,22,.9)",
): void {
  const r = Math.min(w, h) * 0.16;
  const path = new Path2D();
  path.moveTo(x + r, y);
  path.arcTo(x + w, y, x + w, y + h, r);
  path.arcTo(x + w, y + h, x, y + h, r);
  path.arcTo(x, y + h, x, y, r);
  path.arcTo(x, y, x + w, y, r);
  path.closePath();
  ctx.fillStyle = fill;
  ctx.fill(path);
  strokeGlow(ctx, path, hex, Math.max(1.2, Math.min(w, h) * 0.022), 1);
}

/**
 * One body of the kind that falls down a column: a lobed contour that wobbles,
 * lit from inside.
 *
 * `t` is the page's own clock, handed straight to `blobPath`, which is what
 * makes it *fluid* rather than a circle — the same argument `living-draw.ts`
 * makes on the field, where every body is drawn this way.
 */
export function body(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  r: number,
  hex: string,
  t: number,
  seed = 1907,
): void {
  halo(ctx, cx, cy, r * 2.2, hex, 0.45);
  const path = new Path2D(blobPath(cx, cy, r, r * 0.88, 3, 0.1, 0.06, t, seed, 30));
  // Deep rather than dark: an outline with nothing but the background inside
  // it reads as a hole cut in the page, and this is meant to look like
  // something wet standing on it.
  ctx.fillStyle = mixHex(hex, "#0B0718", 0.72);
  ctx.fill(path);
  strokeGlow(ctx, path, hex, Math.max(1.2, r * 0.16), 1);
  // The wet spot every body on the field has: what makes it read as slime
  // rather than as a shape with a line round it.
  ctx.globalCompositeOperation = "lighter";
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.28, cy - r * 0.32, r * 0.3, r * 0.19, -0.5, 0, Math.PI * 2);
  ctx.fillStyle = "rgba(255,255,255,.34)";
  ctx.fill();
  ctx.globalCompositeOperation = "source-over";
}

/** The hull, as the curve it is: a low arc with a swelling standing on it. */
export function hull(
  ctx: CanvasRenderingContext2D,
  b: FigureBox,
  lobeAt: number,
  hex: string,
  t = 0,
): void {
  const y = b.y + b.h * 0.86;
  const arc = new Path2D();
  arc.moveTo(b.x, y + b.h * 0.05);
  arc.quadraticCurveTo(b.x + b.w / 2, y - b.h * 0.06, b.x + b.w, y + b.h * 0.05);
  strokeGlow(ctx, arc, PALETTE.hull, Math.max(1.5, b.h * 0.022), 1);
  const r = b.h * 0.07;
  const cx = b.x + b.w * lobeAt;
  halo(ctx, cx, y - r * 0.5, r * 2.4, hex, 0.5);
  const lobe = new Path2D(blobPath(cx, y - r * 0.5, r, r * 0.9, 3, 0.06, 0.03, t, 2207, 24));
  ctx.fillStyle = mixHex(hex, "#0B0718", 0.7);
  ctx.fill(lobe);
  strokeGlow(ctx, lobe, hex, Math.max(1.2, r * 0.22), 1);
}

/**
 * A run of goo hanging off an edge, the same one the guide's bar drips
 * (`nav-button.ts`). Reached for rather than copied: a second drip that
 * swelled on a different clock would be the one thing on the page that looked
 * like it came from somewhere else.
 */
export function drip(
  ctx: CanvasRenderingContext2D,
  x: number,
  top: number,
  reach: number,
  hex: string,
  phase: number,
): void {
  drawNavFeeder(ctx, x, top, top + reach, hex, phase);
}
