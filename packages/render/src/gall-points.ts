import { GALL_POINTS, gallSeatAt, type SimConfig } from "@neon-spore/sim";
import { gallMidAt, gallPointAt, gallRipple } from "./gall-shape.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { showsGallReach } from "./view-role-clocks-c.js";

/**
 * **THE GALL's seam, named for saying out loud**: a number under each of its
 * four points, a bracket under each seat's half, and a bar across the middle
 * — asked for by the owner on 8 October 2026, when the scars alone gave the
 * pair no place to call and no middle to see. *"Three!"* is a place the
 * partner's eyes can go in one word, and a jump across the bar is a jump to
 * the other seat's half.
 *
 * **The numbers are the points', one to four left to right as the field is
 * drawn**, so both screens say the same word for the same place. Each half's
 * numbers and bracket are full on the screen of the seat whose half it is
 * and dim on the other's — *yours*, and *theirs* — `showsGallReach`'s
 * split, called rather than copied. They stand under the seam, clear of the
 * creature, which stands above it, and ride its ripple with it, as does a
 * stud on the seam at each point, so a number is tied to its place. A leap
 * over the bar is a leap to the other seat's half.
 */

/** How far under the seam the numbers stand, and their height, in tiles. */
const NUMBER_DROP = 0.95;
const NUMBER_SIZE = 0.55;
/** How far under the seam the brackets run, and how far they reach past their outer numbers. */
const BRACKET_DROP = 1.38;
const BRACKET_REACH = 0.42;
/** The bar's reach above and below the seam, in tiles. */
const BAR_UP = 0.75;
const BAR_DOWN = 1.55;
/** The stud on the seam at each point, its radius in tiles. */
const STUD = 0.09;
/** How strong a half is on the screen of the seat it is not. */
const THEIRS = 0.4;

/** The seam's middle at `x` this instant, lifted by its ripple. */
type SeamAt = (x: number) => number;

/**
 * The numbers, the studs, the brackets and the middle bar, on the seam as it
 * ripples at `time`.
 */
export function drawGallPoints(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  time: number,
  ripple: number,
): void {
  const seam: SeamAt = (x) => gallPointAt(l, cfg, 0).y + gallRipple(l, x, time, ripple);
  ctx.save();
  drawBar(ctx, l, cfg, seam, 1);
  for (const seat of [1, 2] as const) {
    const alpha = showsGallReach(l.role, seat) ? 1 : THEIRS;
    drawBracket(ctx, l, cfg, seat, seam, alpha);
  }
  ctx.font = `bold ${Math.round(l.tile * NUMBER_SIZE)}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let p = 0; p < GALL_POINTS; p++) {
    const x = gallPointAt(l, cfg, p).x;
    const y = seam(x);
    const alpha = showsGallReach(l.role, gallSeatAt(p)) ? 1 : THEIRS;
    ctx.fillStyle = rgba(PALETTE.hullRim, alpha);
    ctx.beginPath();
    ctx.arc(x, y, STUD * l.tile, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillText(String(p + 1), x, y + NUMBER_DROP * l.tile);
  }
  ctx.restore();
}

/** The bar across the seam over the middle column, with a diamond where it crosses. */
function drawBar(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  seam: SeamAt,
  alpha: number,
): void {
  const x = gallMidAt(l, cfg).x;
  const y = seam(x);
  const bar = new Path2D();
  bar.moveTo(x, y - BAR_UP * l.tile);
  bar.lineTo(x, y + BAR_DOWN * l.tile);
  const d = 0.16 * l.tile;
  const diamond = new Path2D();
  diamond.moveTo(x, y - d);
  diamond.lineTo(x + d, y);
  diamond.lineTo(x, y + d);
  diamond.lineTo(x - d, y);
  diamond.closePath();
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.9 * alpha);
  ctx.stroke(bar);
  strokeGlow(ctx, bar, PALETTE.hullRim, STROKE.inner, 0.6 * alpha);
  ctx.fillStyle = rgba(PALETTE.hullRim, alpha);
  ctx.fill(diamond);
}

/** A seat's half: a line under its two numbers, turned up at either end. */
function drawBracket(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  seat: 1 | 2,
  seam: SeamAt,
  alpha: number,
): void {
  const xs: number[] = [];
  for (let p = 0; p < GALL_POINTS; p++) {
    if (gallSeatAt(p) === seat) xs.push(gallPointAt(l, cfg, p).x);
  }
  const reach = BRACKET_REACH * l.tile;
  const a = Math.min(...xs) - reach;
  const b = Math.max(...xs) + reach;
  const by = (seam(a) + seam(b)) / 2 + BRACKET_DROP * l.tile;
  const lip = 0.22 * l.tile;
  const bracket = new Path2D();
  bracket.moveTo(a, by - lip);
  bracket.lineTo(a, by);
  bracket.lineTo(b, by);
  bracket.lineTo(b, by - lip);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.lineWidth = STROKE.inner;
  ctx.strokeStyle = rgba(PALETTE.hullRim, 0.85 * alpha);
  ctx.stroke(bracket);
}
