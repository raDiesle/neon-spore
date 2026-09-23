import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE LEDGER is made of**: plating — two halves of dark metal, lit from
 * the upper left and gone to the deep at the far lower edge, each laid in
 * bands whose seams are a dark groove with a lit lip under it and a rivet at
 * each end, a bevel caught along its top and a glint high on the plate. It is
 * no longer a grey fill with a pale line drawn round it, which is the one
 * picture the brief rules out by name (`new-boss-more` §6.3).
 *
 * Split off `ledger-draw.ts`, which decides *what* the halves say — how far
 * apart, which colour the cut face shows — so it stays about the fight and
 * this one about the material. The cut face and the seam keep their lit lines:
 * they are the colour a bolt has to be, which is information and not body.
 *
 * **Every width is off the tile**, never off the half's size: the halves
 * breathe, and a width that followed them would change every frame.
 */

/** Where one half stands, for `paintPlate`. */
export interface Plate {
  /** The x of its cut face, and which way it runs from there. */
  inner: number;
  side: -1 | 1;
  /** Its full width out from the cut, and its height. */
  w: number;
  top: number;
  bottom: number;
  tile: number;
}

/** Where the plate bands meet, as a share of the height. */
const BANDS = [0.3, 0.62] as const;

export function paintPlate(ctx: CanvasRenderingContext2D, body: Path2D, p: Plate): void {
  const { inner, side, w, top, bottom, tile } = p;
  const outer = inner + side * w;
  const h = bottom - top;
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(body);
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  // Lit from the upper left, whichever half this is.
  const left = Math.min(inner, outer);
  const light = ctx.createLinearGradient(left, top, left + w, bottom);
  light.addColorStop(0, rgba(PALETTE.sheenRim, 0.16));
  light.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
  light.addColorStop(0.55, rgba(PALETTE.sheenDeep, 0));
  light.addColorStop(1, rgba(PALETTE.sheenDeep, 0.3));
  ctx.fillStyle = light;
  ctx.fill(body);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (const at of BANDS) band(ctx, inner, side, w, top + h * at, tile);
  // The bevel along its top, caught by the light, and the lower wall gone to
  // the deep: stroked wide inside the plate over one band of its height each,
  // never all round, which was the outline.
  wall(ctx, body, inner, side, w, top - tile, top + h * 0.22, tile * 0.1, PALETTE.rock, 0.3);
  wall(
    ctx,
    body,
    inner,
    side,
    w,
    bottom - h * 0.25,
    bottom + tile,
    tile * 0.1,
    PALETTE.sheenDeep,
    0.3,
  );
  ctx.restore();
  // The glint, high on the plate towards the light.
  const gx = inner + side * w * (side < 0 ? 0.62 : 0.3);
  const gy = top + h * 0.17;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.2);
  ctx.beginPath();
  ctx.ellipse(gx, gy, w * 0.16, tile * 0.05, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.8);
  ctx.beginPath();
  ctx.arc(gx - w * 0.07, gy - tile * 0.02, Math.max(0.8, tile * 0.03), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** One seam between plate bands: a dark groove, its lit lip, two rivets. */
function band(
  ctx: CanvasRenderingContext2D,
  inner: number,
  side: -1 | 1,
  w: number,
  y: number,
  tile: number,
): void {
  const x0 = inner;
  const x1 = inner + side * w;
  const sag = tile * 0.08;
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = Math.max(1, tile * 0.045);
  ctx.beginPath();
  ctx.moveTo(x0, y);
  ctx.quadraticCurveTo((x0 + x1) / 2, y + sag, x1, y);
  ctx.stroke();
  const lip = Math.max(1, tile * 0.03);
  ctx.globalAlpha = 0.3;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = Math.max(0.8, tile * 0.018);
  ctx.beginPath();
  ctx.moveTo(x0, y + lip);
  ctx.quadraticCurveTo((x0 + x1) / 2, y + sag + lip, x1, y + lip);
  ctx.stroke();
  for (const u of [0.22, 0.6]) rivet(ctx, inner + side * w * u, y + sag * 0.9 + tile * 0.1, tile);
  ctx.globalAlpha = 1;
}

/** A rivet head: rock, shaded, with a point of light on it. */
function rivet(ctx: CanvasRenderingContext2D, x: number, y: number, tile: number): void {
  const r = Math.max(1, tile * 0.04);
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = PALETTE.rock;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.5;
  ctx.fillStyle = PALETTE.sheenDeep;
  ctx.beginPath();
  ctx.arc(x + r * 0.3, y + r * 0.35, r * 0.7, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 0.85;
  ctx.fillStyle = PALETTE.sheenRim;
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, Math.max(0.5, r * 0.3), 0, Math.PI * 2);
  ctx.fill();
}

/** The plate stroked wide inside itself, over one band of its height. */
function wall(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  inner: number,
  side: -1 | 1,
  w: number,
  from: number,
  to: number,
  width: number,
  colour: string,
  a: number,
): void {
  const left = Math.min(inner, inner + side * w) - width;
  ctx.save();
  ctx.beginPath();
  ctx.rect(left, from, w + width * 2, to - from);
  ctx.clip();
  ctx.lineWidth = width;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(body);
  ctx.restore();
}
