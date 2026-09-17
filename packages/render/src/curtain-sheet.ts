import { blobPoints } from "@neon-spore/content";
import { type Color, CURTAIN_COLS } from "@neon-spore/sim";
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
/** A lobe's radius, in tiles, and how far the hem lifts where one is gone. */
const LOBE_R = 0.15;
const HEM_LIFT = 0.16;
/** The fabric's alpha: through it, a colour is a shadow. */
const SHEET_ALPHA = 0.3;

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
  time: number,
): void {
  const t = l.tile;
  const railY = cy - t * RAIL_RISE;
  const hemY = cy + t * HEM_DROP;
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
  ctx.save();
  ctx.globalAlpha = SHEET_ALPHA;
  ctx.fillStyle = PALETTE.hull;
  ctx.fill(path);
  ctx.restore();
  strokeGlow(ctx, path, PALETTE.hull, STROKE.inner, 0.5);
  // Folds: one a column, swaying, from the rail to the hem's trail.
  const folds = new Path2D();
  for (let i = 1; i < CURTAIN_COLS; i++) {
    const x = x0 + i * t;
    const sway = Math.sin(time * 2.1 + i * 1.3) * t * 0.04;
    folds.moveTo(x, railY);
    folds.quadraticCurveTo(x + sway, cy, x + lag, hemY - t * 0.05);
  }
  ctx.save();
  ctx.globalAlpha = 0.35;
  ctx.strokeStyle = PALETTE.hullRim;
  ctx.lineWidth = STROKE.inner;
  ctx.stroke(folds);
  ctx.restore();
  // The lobes along the hem: the boss's health, and the pilot's soft ones lit.
  for (let i = 0; i < CURTAIN_COLS; i++) {
    if (!(lobes[i] ?? false)) continue;
    const x = x0 + (i + 0.5) * t + lag;
    const y = hemY + t * LOBE_R * 0.6;
    const lit = soft.includes(i);
    if (lit) halo(ctx, x, y, t * 0.5, PALETTE.hull, 0.55 + 0.25 * Math.sin(time * 5 + i));
    ctx.fillStyle = lit ? PALETTE.hullRim : PALETTE.dim;
    ctx.beginPath();
    ctx.arc(x, y, t * LOBE_R, 0, Math.PI * 2);
    ctx.fill();
    const rim = new Path2D();
    rim.arc(x, y, t * LOBE_R, 0, Math.PI * 2);
    strokeGlow(ctx, rim, lit ? PALETTE.hullRim : PALETTE.hull, STROKE.inner, lit ? 1 : 0.4);
  }
}

/**
 * The core: a blob in its colour. Covered, it is a shadow — a halo and a
 * dimmed disc for the fabric to be drawn over; bare, a body with a rim;
 * naked (torn), the same body pulsing, because it is firing faster and has
 * nothing left to hide behind. `out` runs 0 → 1 over `curtainOutBeats` as
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
  ctx.save();
  ctx.globalAlpha = fade;
  ctx.fillStyle = color === "red" ? PALETTE.redDark : PALETTE.cyanDark;
  ctx.fill(path);
  strokeGlow(ctx, path, rimHex, STROKE.outline, 1);
  ctx.fillStyle = rimHex;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
