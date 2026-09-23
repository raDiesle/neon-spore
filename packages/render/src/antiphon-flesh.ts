import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE ANTIPHON is made of**: a long mantle of membrane, lit along its
 * top and gone to the deep at its hem, its hem lit from inside where the
 * organs hang, creased across between its lobes and wet with a streak of
 * film — glassier when it is still; the pits it keeps sunk in it as wet
 * sockets, shadowed under the lip and lit dim at the bottom; and the organs
 * and candidates as buds of flesh in their colour, each shaded, lit inside
 * its lower wall in its rim, with a wet point. It is no longer a violet fill
 * with a glowing line drawn round the body, round every pit and round every
 * bud, which is the one picture the brief rules out by name
 * (`new-boss-more` §6.3).
 *
 * Split off `antiphon-draw.ts`, which decides *what* is shown to whom — the
 * organ on one screen, the rail on the other — so it stays about the fight
 * and this one about the material. The window and the grips are interface
 * and drawn there as they were. Colours go in plain at the fade with the
 * strength in the alpha, so the frame tests count the hull, its rim, the dim
 * and the colours' rims on the op log.
 *
 * **Every width is off the tile.**
 */

/**
 * A colour at the fade: the hex itself while the body stands, so the frame
 * tests can count it, and an `rgba` once it is going.
 */
export function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The mantle's box this frame. */
export interface Mantle {
  left: number;
  right: number;
  top: number;
  bottom: number;
  tile: number;
  /** How many lobes its hem has, for the creases between them. */
  lobes: number;
}

export function paintMantle(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  m: Mantle,
  fade: number,
  still: boolean,
): void {
  const { left, right, top, bottom, tile } = m;
  const h = bottom - top;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(body);
  ctx.globalAlpha = still ? 0.42 : 0.3;
  ctx.fillStyle = faded(PALETTE.hull, fade);
  ctx.fill(body);
  ctx.globalAlpha = 1;
  ctx.clip(body);
  const shade = ctx.createLinearGradient(0, top, 0, bottom + tile * 0.2);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.16 * fade));
  shade.addColorStop(0.3, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.55, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.45 * fade));
  ctx.fillStyle = shade;
  ctx.fill(body);
  // The creases: where the hem's lobes meet, the membrane folds up into it.
  const step = (right - left) / Math.max(1, m.lobes);
  ctx.lineCap = "round";
  ctx.strokeStyle = faded(PALETTE.sheenDeep, fade);
  ctx.lineWidth = Math.max(1, tile * 0.04);
  ctx.globalAlpha = 0.3;
  for (let i = 1; i < m.lobes; i++) {
    const x = left + step * i;
    ctx.beginPath();
    ctx.moveTo(x, bottom);
    ctx.quadraticCurveTo(x + step * 0.08, bottom - h * 0.35, x - step * 0.04, bottom - h * 0.6);
    ctx.stroke();
  }
  // Its hem, lit from inside as a glow rising into it, never a line; its
  // top, the membrane's thickness caught by the light, stroked wide inside
  // it over that band only.
  const hem = ctx.createLinearGradient(0, bottom - h * 0.45, 0, bottom + tile * 0.1);
  hem.addColorStop(0, rgba(PALETTE.hullRim, 0));
  hem.addColorStop(1, rgba(PALETTE.hullRim, (still ? 0.35 : 0.22) * fade));
  ctx.fillStyle = hem;
  ctx.fill(body);
  band(ctx, body, m, top - tile, top + h * 0.25, faded(PALETTE.hull, fade), 0.3);
  ctx.restore();
  // The film: a long streak along the top, glassier when still.
  const a = (still ? 0.3 : 0.18) * fade;
  const fx = left + (right - left) * 0.3;
  const fy = top + h * 0.28;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(fx, fy, (right - left) * 0.14, tile * 0.05, -0.03, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, Math.min(1, a * 3.5));
  ctx.beginPath();
  ctx.arc(fx - (right - left) * 0.1, fy, Math.max(0.8, tile * 0.035), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * A pit: a wet socket in the shape that made it, dark, the lip's shadow over
 * its top and its floor lit dim.
 */
export function paintPit(
  ctx: CanvasRenderingContext2D,
  pit: Path2D,
  y: number,
  r: number,
  tile: number,
  fade: number,
): void {
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade, 0.8);
  ctx.fill(pit);
  ctx.clip(pit);
  ctx.lineJoin = "round";
  cut(ctx, pit, y + r * 0.1, y + r * 2, tile * 0.06, faded(PALETTE.dim, fade), 0.7);
  cut(ctx, pit, y - r * 2, y - r * 0.2, tile * 0.08, faded(PALETTE.sheenDeep, fade), 0.7);
  ctx.restore();
}

/**
 * A bud: an organ or a candidate, flesh of `hex` shaded, its lower wall lit
 * from inside in `rim`, a wet point on it.
 */
export function paintBud(
  ctx: CanvasRenderingContext2D,
  bud: Path2D,
  x: number,
  y: number,
  r: number,
  tile: number,
  hex: string,
  rim: string,
  fade: number,
): void {
  ctx.save();
  ctx.globalAlpha = 0.75;
  ctx.fillStyle = faded(hex, fade);
  ctx.fill(bud);
  ctx.globalAlpha = 1;
  ctx.clip(bud);
  const shade = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r * 1.2);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.3 * fade));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.5 * fade));
  ctx.fillStyle = shade;
  ctx.fill(bud);
  ctx.lineJoin = "round";
  cut(ctx, bud, y, y + r * 2, tile * 0.1, faded(rim, fade), 0.8);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85 * fade);
  ctx.beginPath();
  ctx.arc(x - r * 0.35, y - r * 0.35, Math.max(0.8, r * 0.12), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The mantle stroked wide inside itself over the band from `from` to `to`. */
function band(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  m: Mantle,
  from: number,
  to: number,
  colour: string,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(m.left - m.tile, from, m.right - m.left + m.tile * 2, to - from);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = m.tile * 0.12;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(body);
  ctx.restore();
}

/** A small shape stroked wide inside itself over one band of its height. */
function cut(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  from: number,
  to: number,
  width: number,
  colour: string,
  a: number,
): void {
  ctx.save();
  ctx.beginPath();
  ctx.rect(-1e5, from, 2e5, to - from);
  ctx.clip();
  ctx.lineWidth = width;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(p);
  ctx.restore();
}
