import { rgba } from "./hex.js";
import { faded } from "./lead-rock.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE LEAD is made of**, the living part: a mound of wet flesh
 * swelling out of the ridge (`lead-rock.ts`), sunk in a dark socket where it meets the rock; and
 * a stalk that is a cord with a lit side, strung with beads that are each a
 * shaded drop, and a pale organ at the tip with a pore in it. It is no longer
 * a fill with a glowing line round the ridge, round the mound and round the
 * tip, which is the one picture the brief rules out by name
 * (`new-boss-more` §6.3).
 *
 * Split off `lead-draw.ts`, which decides *what* is shown to whom — where the
 * stalk stands, which way it lies, whether it is still — so it stays about the
 * fight and this one about the material. The shots, the pilot's sill and the
 * lock are interface and drawn there as they were.
 *
 * **Every width is off the tile.**
 */

/**
 * The mound: a swell of flesh out of the rock, `hex` its skin and `rim` the
 * light inside its lower wall, sunk in the dark socket it grows from.
 */
export function paintMound(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  tile: number,
  hex: string,
  rim: string,
  fade: number,
): void {
  ctx.save();
  ctx.fillStyle = rgba(hex, 0.7 * fade);
  ctx.fill(body);
  ctx.clip(body);
  const shade = ctx.createRadialGradient(x - rx * 0.3, y - ry * 0.7, 0, x, y, rx * 1.1);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.25 * fade));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.5 * fade));
  ctx.fillStyle = shade;
  ctx.fill(body);
  // Its lower wall, lit from inside where it comes up out of the rock.
  ctx.beginPath();
  ctx.rect(x - rx * 2, y - ry * 0.45, rx * 4, ry);
  ctx.clip();
  ctx.lineWidth = tile * 0.12;
  ctx.strokeStyle = faded(rim, fade);
  ctx.globalAlpha = 0.45;
  ctx.stroke(body);
  ctx.restore();
  // The socket: the rock's dark, closed round its foot.
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenDeep, 0.6 * fade);
  ctx.beginPath();
  ctx.ellipse(x, y, rx * 1.02, tile * 0.07, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  film(ctx, x - rx * 0.4, y - ry * 0.55, rx * 0.2, tile * 0.04, 0.25 * fade);
}

/** The stem's width, in tiles. */
export const STEM = 0.07;

/** The stalk's stem: a cord of `hex`, its back gone deep on the side from the key, with a thin wet line down its lit side. */
export function paintStem(
  ctx: CanvasRenderingContext2D,
  stem: Path2D,
  hex: string,
  tile: number,
  a: number,
): void {
  const w = tile * STEM;
  ctx.save();
  ctx.lineCap = "round";
  ctx.globalAlpha = a;
  ctx.strokeStyle = hex;
  ctx.lineWidth = w;
  ctx.stroke(stem);
  ctx.save();
  ctx.translate(w * 0.25, 0);
  ctx.globalAlpha = a * 0.5;
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.lineWidth = w * 0.45;
  ctx.stroke(stem);
  ctx.restore();
  ctx.translate(-w * 0.25, 0);
  ctx.globalAlpha = a * 0.5;
  ctx.strokeStyle = PALETTE.sheenRim;
  ctx.lineWidth = Math.max(0.8, tile * 0.015);
  ctx.stroke(stem);
  ctx.restore();
}

/**
 * A bead on the stalk, or the organ at its tip: a drop of `hex`, shaded, with
 * a wet point; the tip has a pore in its crown.
 */
export function paintBead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  hex: string,
  a: number,
  tip: boolean,
): void {
  ctx.save();
  ctx.globalAlpha = a;
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  const shade = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, 0, x, y, r * 1.1);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.3));
  shade.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.55));
  ctx.fillStyle = shade;
  ctx.fill();
  if (tip) {
    ctx.fillStyle = rgba(PALETTE.sheenDeep, 0.6);
    ctx.beginPath();
    ctx.ellipse(x + r * 0.1, y - r * 0.05, r * 0.28, r * 0.18, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.85);
  ctx.beginPath();
  ctx.arc(x - r * 0.4, y - r * 0.4, Math.max(0.7, r * 0.18), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/** The wet film: a soft bloom and a hard point at its left end. */
function film(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  a: number,
): void {
  if (a <= 0) return;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, Math.min(1, a * 3));
  ctx.beginPath();
  ctx.arc(x - rx * 0.5, y, Math.max(0.8, ry * 0.5), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
