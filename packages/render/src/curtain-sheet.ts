import { blobPoints } from "@neon-spore/content";
import { type Color, CURTAIN_COLS } from "@neon-spore/sim";
import { paintBead, paintCoreBody, paintSheet } from "./curtain-flesh.js";
import { halo, strokeGlow } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE CURTAIN's two shapes: the membrane with its hem, and the core.
 *
 * Cut off `curtain-draw.ts` along the seam THE GORGE's lobe was: next door
 * is *what is shown to whom*, this is *what the things look like*, and
 * neither reads the world. The fabric is hull violet at a fraction of its
 * alpha — the one colour on this field nobody fires — so a red or cyan
 * shadow behind it reads as a colour through a grey, and a bare core in
 * either reads as a torch does. A soft lobe is lit in the hull's rim, the
 * way a torch is lit, and nothing else on the sheet is bright.
 */

/** How far below the row's centre the hem hangs, in tiles. */
const HEM_DROP = 0.42;
/** How far above it the rail is. */
const RAIL_RISE = 0.5;
/** Both of them again for `curtain-grip.ts`, which has to know how far the hem
 * may be carried before it is at the rail: the ring rides the edge this file
 * draws, and a reach worked out from a second copy of these would be a handle
 * that parted company with the cloth under it. */
export const CURTAIN_HEM_DROP = HEM_DROP;
export const CURTAIN_RAIL_RISE = RAIL_RISE;
/** A lobe's radius, in tiles, and how far the hem lifts where one is gone. */
const LOBE_R = 0.15;
const HEM_LIFT = 0.16;

export function drawCurtainSheet(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  /** The fabric's left edge, already carried through the shove. */
  x0: number,
  /** The row's centre. */
  cy: number,
  lobes: readonly boolean[],
  /** Indexes of the lobes drawn lit; the pilot's, empty on the navigator's screen. */
  soft: readonly number[],
  /** The hem's trail behind the rail, in pixels. */
  lag: number,
  /**
   * How far the pilot has gathered the hem off the floor, in pixels
   * (`curtain-grip.ts`). Nought in every state but the jammed one. The whole
   * sheet does not rise: the rail is fixed and the bottom edge comes up to it,
   * which is what gathering a curtain looks like and is why the gap it opens
   * is over the core rather than beside it.
   */
  lift: number,
  time: number,
): void {
  const t = l.tile;
  const railY = cy - t * RAIL_RISE;
  const hemY = cy + t * HEM_DROP - lift;
  const x1 = x0 + CURTAIN_COLS * t;
  // The membrane: straight along the rail, a scallop between lobes along
  // the hem, lifted where a lobe has come off and nothing weighs it.
  const path = new Path2D();
  path.moveTo(x0, railY);
  path.lineTo(x1, railY);
  const hemAt = (i: number): number =>
    hemY - ((lobes[i] ?? false) ? 0 : t * HEM_LIFT) + Math.sin(time * 1.7 + i) * t * 0.02;
  // Down the right edge, then back along the hem a scallop at a time.
  path.lineTo(x1 + lag, hemAt(CURTAIN_COLS - 1));
  for (let i = CURTAIN_COLS - 1; i >= 0; i--) {
    const y = hemAt(i);
    const xr = x0 + (i + 1) * t + lag;
    const xl = x0 + i * t + lag;
    path.quadraticCurveTo((xl + xr) / 2, y + t * 0.12, xl, y);
  }
  path.closePath();
  // Folds: one a column, swaying, from the rail to the hem's trail — each a
  // lit line and, just to its right, the side of it turned from the light.
  const folds = new Path2D();
  const shadows = new Path2D();
  for (let i = 1; i < CURTAIN_COLS; i++) {
    const x = x0 + i * t;
    const sway = Math.sin(time * 2.1 + i * 1.3) * t * 0.04;
    folds.moveTo(x, railY);
    folds.quadraticCurveTo(x + sway, (railY + hemY) / 2, x + lag, hemY - t * 0.05);
    shadows.moveTo(x + t * 0.07, railY);
    shadows.quadraticCurveTo(x + t * 0.08 + sway, (railY + hemY) / 2, x + t * 0.07 + lag, hemY);
  }
  paintSheet(ctx, path, folds, shadows, { x0, x1, railY, hemY, tile: t });
  // The lobes along the hem: the boss's health, and the pilot's soft ones lit.
  for (let i = 0; i < CURTAIN_COLS; i++) {
    if (!(lobes[i] ?? false)) continue;
    const x = x0 + (i + 0.5) * t + lag;
    const y = hemY + t * LOBE_R * 0.6;
    const lit = soft.includes(i);
    if (lit) halo(ctx, x, y, t * 0.5, PALETTE.hull, 0.55 + 0.25 * Math.sin(time * 5 + i));
    paintBead(ctx, x, y, t * LOBE_R, lit);
  }
}

/**
 * **The jammed rail**: a bar of metal laid along the sheet's top edge while a
 * hit holds it, brightest the beat it lands and gone as the jam runs out
 * (`sim/curtain-step.ts`). It is the pair's only clock on this state, so the
 * brightness *is* the count — there is no number and no word for how long,
 * because a number would be a second clock to read against the first.
 *
 * Rock grey, and the one grey thing on a violet sheet: the rail is the part
 * of this boss that is not cloth, and a bar in the hull's own colour would
 * read as a fold.
 */
export function drawCurtainJam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x0: number,
  cy: number,
  /** How much of the jam is left, 1 at the hit and 0 as the rail frees. */
  left: number,
): void {
  if (left <= 0) return;
  const t = l.tile;
  const y = cy - t * RAIL_RISE;
  const bar = new Path2D();
  bar.moveTo(x0, y);
  bar.lineTo(x0 + CURTAIN_COLS * t, y);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.65 * left;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.lineCap = "butt";
  ctx.stroke(bar);
  ctx.restore();
  strokeGlow(ctx, bar, PALETTE.rockDark, STROKE.inner, 0.4 * left);
}

/**
 * The core: a blob in its colour. Covered, it is a shadow — a halo and a
 * dimmed disc for the fabric to be drawn over; bare, a body of flesh
 * (`curtain-flesh.ts`); naked (torn), the same body throbbing, because it is
 * firing faster and has nothing left to hide behind. `out` runs 0 → 1 over `curtainOutBeats` as
 * it goes.
 */
export function drawCurtainCore(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  color: Color,
  bare: boolean,
  naked: boolean,
  out: number,
  time: number,
): void {
  const t = l.tile;
  const hex = color === "red" ? PALETTE.red : PALETTE.cyan;
  const rimHex = color === "red" ? PALETTE.redRim : PALETTE.cyanRim;
  const fade = Math.max(0, 1 - out);
  if (fade <= 0) return;
  const pulse = naked ? 1 + 0.08 * Math.sin(time * 9) : 1;
  const r = t * 0.3 * pulse * (bare ? 1 : 0.85);
  if (!bare) {
    // The shadow: what a colour looks like behind a grey.
    halo(ctx, x, y, t * 0.9, hex, 0.45 * fade);
    ctx.save();
    ctx.globalAlpha = 0.55 * fade;
    ctx.fillStyle = hex;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    return;
  }
  halo(ctx, x, y, t * (naked ? 1.3 : 1), hex, (naked ? 0.8 : 0.6) * fade);
  const path = splinePath(blobPoints(x, y, r, r, 5, 0.14, 0.05, time * 0.9, 47, 32), true);
  const dark = color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
  const beat = naked ? 0.5 + 0.5 * Math.sin(time * 9) : 0;
  paintCoreBody(ctx, path, x, y, r, t, hex, dark, rimHex, beat, fade);
}
