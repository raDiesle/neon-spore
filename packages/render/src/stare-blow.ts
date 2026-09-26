import type { StrikeFrame } from "./boss-strike-look.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE STARE's own blow at the hull** (`boss-strike-look.ts`). Its gaze is
 * already in the picture: a fan of red that fades a few rows down
 * (`stare-draw.ts`'s `drawGaze`). When it catches a seat pressing, the look
 * lands. The fan draws in to one hard ray, red-hot along its core, that burns all
 * the way down the middle column. Where it meets the plating it brands the
 * eye's own almond into the hull, with its pupil, glowing red and cooling as
 * the ray lets go.
 */

/** The ray's half-width at the socket and at the hull, in tiles. */
const WIDE = 0.55;
const NARROW = 0.1;
/** The brand's half-width, and its height as a share of that — flat, lying on the skin. */
const BRAND = 0.75;
const BRAND_FLAT = 0.34;

export function stareBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  ctx.save();
  // The ray: its front runs down the column, then it thins and lets go.
  const front = from.y + (to.y - from.y) * (1 - (1 - f.reach) ** 2);
  const thin = 1 - 0.7 * f.after;
  const ray = new Path2D();
  ray.moveTo(from.x - WIDE * tile * thin, from.y);
  ray.lineTo(from.x + WIDE * tile * thin, from.y);
  ray.lineTo(to.x + NARROW * tile * thin, front);
  ray.lineTo(to.x - NARROW * tile * thin, front);
  ray.closePath();
  const g = ctx.createLinearGradient(0, from.y, 0, to.y);
  g.addColorStop(0, rgba(PALETTE.red, 0.2 * fade));
  g.addColorStop(1, rgba(PALETTE.red, 0.75 * fade));
  ctx.fillStyle = g;
  ctx.fill(ray);
  ctx.strokeStyle = rgba(PALETTE.redRim, 0.9 * fade);
  ctx.lineWidth = tile * 0.05 * thin;
  ctx.beginPath();
  ctx.moveTo(from.x, from.y);
  ctx.lineTo(to.x, front);
  ctx.stroke();
  if (f.reach >= 1) {
    // The brand: the eye's almond burned into the plating, and its pupil.
    const w = BRAND * tile * (0.6 + 0.4 * Math.min(1, f.after * 4));
    const h = w * BRAND_FLAT;
    const almond = new Path2D();
    almond.moveTo(to.x - w, to.y);
    almond.quadraticCurveTo(to.x, to.y - h * 2, to.x + w, to.y);
    almond.quadraticCurveTo(to.x, to.y + h * 2, to.x - w, to.y);
    almond.closePath();
    ctx.fillStyle = rgba(PALETTE.redDark, 0.85 * fade);
    ctx.fill(almond);
    const hot = f.after < 0.25 ? PALETTE.redRim : PALETTE.red;
    strokeGlow(ctx, almond, hot, STROKE.outline, 2.5 * fade);
    ctx.fillStyle = rgba(hot, fade);
    ctx.beginPath();
    ctx.ellipse(to.x, to.y, h * 0.45, h * 0.8, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}
