import { livingPoints, livingSilhouette } from "@neon-spore/content";
import { type Color, livingKindForColor } from "@neon-spore/sim";
import { clipInside } from "./body-inset.js";
import { drawDetails } from "./creature-detail.js";
import { livingRadius, livingScale } from "./creature-place.js";
import { colorTrio } from "./creature-tint.js";
import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { LIVING_SKIN } from "./living-skin.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **One bud of THE BROOD**, on its stalk: the slick or the bulb it is growing
 * into, drawn as that body is drawn — its own silhouette, its own skin, its
 * own interior (`living-draw.ts`) — and small, swelling to full size as it
 * ripens. So the word the pair already has for it is the word it needs: a red
 * bud *is* a slick, a cyan one *is* a bulb.
 *
 * **Ripeness is read off the bud, never a bar.** It begins a third of a body
 * across on a short stalk; the stalk stretches and the bud swells as it
 * ripens; in the last quarter it shudders on the stalk, faster as it goes,
 * and its own light comes up — the moment before it drops. A dropped bud's
 * stalk is a stub with a small nub on it until the lobe grows it again.
 */

/** How much of a body's footprint a bud is at its first beat, and at its last. */
const BUD_FROM = 0.7;
const BUD_TO = 1.15;
/** Where in its ripening a bud begins to shudder. */
const SHUDDER_FROM = 0.75;

export interface BudPaint {
  /** Where the stalk leaves the belly. */
  rimX: number;
  rimY: number;
  /** The bud's column, in pixels. */
  x: number;
  color: Color;
  /** 0 as it begins, 1 as it drops; below 0 while regrowing (`broodRipe`). */
  ripe: number;
  tile: number;
  time: number;
  /** Clock seed, so two buds never shudder in step. */
  seed: number;
}

/** The stalk, from the belly to the bud's top, in the sac's own flesh. */
function drawStalk(ctx: CanvasRenderingContext2D, p: BudPaint, toX: number, toY: number): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = rgba(PALETTE.vein, 0.95);
  ctx.lineWidth = p.tile * 0.16;
  ctx.beginPath();
  ctx.moveTo(p.rimX, p.rimY - p.tile * 0.05);
  ctx.quadraticCurveTo(p.rimX, (p.rimY + toY) / 2, toX, toY);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.45);
  ctx.lineWidth = p.tile * 0.05;
  ctx.stroke();
  ctx.restore();
}

/** A dropped bud's stub and the nub growing on it, until it is a bud again. */
function drawNub(ctx: CanvasRenderingContext2D, p: BudPaint): void {
  const r = p.tile * 0.12;
  drawStalk(ctx, p, p.rimX, p.rimY + r);
  ctx.save();
  ctx.fillStyle = rgba(colorTrio(p.color).dark, 0.9);
  ctx.strokeStyle = rgba(PALETTE.organRim, 0.6);
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.arc(p.rimX, p.rimY + r, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Where a hanging bud is and how big, without its shudder: what the drawing
 * hangs and what a cue aims at, so the crosshair is on the bud as drawn.
 */
export function broodBudCircle(
  rimY: number,
  x: number,
  ripe: number,
  tile: number,
): { x: number; y: number; r: number } {
  const k = Math.max(0, Math.min(1, ripe));
  const r = livingRadius(tile, BUD_FROM + (BUD_TO - BUD_FROM) * k);
  // The bud grows down out of the belly: its top tucked into the skin while
  // it is small, hanging clear on its stalk as it fills — and the row a bolt
  // meets it on is always across its upper half.
  return { x, y: rimY + r * (0.15 + 0.75 * k), r };
}

export function drawBroodBud(ctx: CanvasRenderingContext2D, p: BudPaint): void {
  if (p.ripe < 0) {
    drawNub(ctx, p);
    return;
  }
  const k = Math.min(1, p.ripe);
  const late = Math.max(0, (k - SHUDDER_FROM) / (1 - SHUDDER_FROM));
  const shake = late * p.tile * 0.08 * Math.sin(p.time * (18 + 22 * late) + p.seed);
  const at = broodBudCircle(p.rimY, p.x, k, p.tile);
  const r = at.r;
  const x = at.x + shake;
  const y = at.y;
  drawStalk(ctx, p, x, y - r * 0.8);

  if (late > 0) halo(ctx, x, y, r * (2 + late), colorTrio(p.color).hex, 0.25 + 0.45 * late);
  paintBroodBody(ctx, p.color, x, y, r, p.time + p.seed * 5.4, 0);
}

/**
 * The slick or the bulb of `color`, drawn as the field draws it, `r` across
 * at (`x`, `y`) and turned `rot` — a bud on its stalk, or a body still inside
 * the sac (`brood-eggs.ts`).
 */
export function paintBroodBody(
  ctx: CanvasRenderingContext2D,
  color: Color,
  x: number,
  y: number,
  r: number,
  t: number,
  rot: number,
): void {
  const kind = livingKindForColor(color);
  const shape = livingSilhouette(kind);
  const scale = livingScale(shape, r);
  const tint = colorTrio(color);
  const path = splinePath(livingPoints(shape, t, 28), true);
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.scale(scale, scale);
  const paint = { hex: tint.hex, rim: tint.rim, dark: tint.dark, rx: shape.rx, ry: shape.ry };
  LIVING_SKIN.paint(ctx, path, "nonzero", { ...paint, r, scale, rot, t });
  ctx.save();
  clipInside(ctx, path, "nonzero");
  drawDetails(ctx, kind, { ...paint, rot, t });
  ctx.restore();
  ctx.restore();
}
