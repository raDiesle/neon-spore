import type { StrikeFrame } from "./boss-strike-look.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE STARE's own blows at the hull** (`boss-strike-look.ts`), and it has
 * two (`sim/stare-step.ts`):
 *
 * - **The laser**, a catch: one hard ray, red-hot along its core, from the
 *   eye to **the column the cannon was sent to** — the owner, 29 September
 *   2026, *the damaging laser hits where one of the players moved* — so the
 *   ray leans across the field when the slide was the press. Where it meets
 *   the plating it brands the eye's own almond into the hull, with its
 *   pupil, cooling as the ray lets go.
 * - **The beam**, a charge nobody vented: a column of ember light the width
 *   of the eye, straight down the middle onto the ship, white at its core —
 *   the massive beam the swelling eye was seen gathering (`stare-charge.ts`).
 */

/** The ray's half-width at the socket and at the hull, in tiles. */
const WIDE = 0.3;
const NARROW = 0.1;
/** The brand's half-width, and its height as a share of that — flat, lying on the skin. */
const BRAND = 0.75;
const BRAND_FLAT = 0.34;

/** The beam's half-width, in tiles: the eye's own. */
const BEAM = 1.1;

export function stareBlow(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  if (f.blow === "beam") stareBeam(ctx, f);
  else stareLaser(ctx, f);
}

function stareBeam(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
  const { from, to, tile } = f;
  const fade = 1 - f.after;
  if (fade <= 0) return;
  const front = from.y + (to.y - from.y) * (1 - (1 - f.reach) ** 3);
  const w = BEAM * tile * (1 - 0.6 * f.after);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = rgba(PALETTE.ember, 0.55 * fade);
  ctx.fillRect(to.x - w, from.y, w * 2, front - from.y);
  ctx.fillStyle = rgba(PALETTE.emberRim, 0.7 * fade);
  ctx.fillRect(to.x - w * 0.45, from.y, w * 0.9, front - from.y);
  ctx.fillStyle = rgba(PALETTE.text, 0.85 * fade);
  ctx.fillRect(to.x - w * 0.15, from.y, w * 0.3, front - from.y);
  if (f.reach >= 1) {
    // Where it lands: a flat splash of the same light along the plating.
    ctx.fillStyle = rgba(PALETTE.emberRim, 0.6 * fade);
    ctx.beginPath();
    ctx.ellipse(to.x, to.y, w * (1.6 + f.after), w * 0.35, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

function stareLaser(ctx: CanvasRenderingContext2D, f: StrikeFrame): void {
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
