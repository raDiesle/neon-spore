import { sinHash } from "./hash.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **The sum as a fluid**: what fills THE SINEW's strain band from its foot up
 * to the sum, on the screens that are shown the sum (`sinew-band.ts`) — the
 * owner, 2 October 2026: *make the brown area look like a chemical bubbling
 * fluid.*
 *
 * A lit amber charge, deepest at the foot and brightest under its surface,
 * with bubbles rising through it and popping at the top; the harder the pair
 * pulls, the faster they come, so the fluid boils as the strain goes on. Its
 * surface is drawn flat: the one line across the band is the sum's own mark,
 * drawn over this by the band, and a wavy surface under it would be a second
 * line to read.
 *
 * Everything here is clipped to the tube, and the bubbles are a fixed handful
 * on the wall clock — a picture, and nothing a thumb is tested against.
 */

/** The tube the fluid stands in: its inside, in field pixels. */
export interface Tube {
  x: number;
  y: number;
  hw: number;
  hh: number;
  tile: number;
}

/** Bubbles: how many, the slowest rise in tubes a second, and how much faster at full strain. */
const BUBBLES = 9;
const RISE = 0.18;
const RISE_STRAIN = 0.5;
/** A bubble's radius, in tiles, at its smallest and its largest. */
const BUBBLE_MIN = 0.035;
const BUBBLE_MAX = 0.075;

/** A fixed scatter in [0, 1) per bubble and per use, so nothing is rolled at draw time. */
const scatter = (i: number, k: number): number => sinHash(i, k);

export function drawSinewFluid(
  ctx: CanvasRenderingContext2D,
  tube: Tube,
  /** The fluid's surface, in field pixels. */
  surface: number,
  /** The sum as a share of the band, 0..1: how hard it boils. */
  strain: number,
  time: number,
): void {
  const { x, y, hw, hh, tile } = tube;
  const foot = y + hh;
  const top = Math.max(y - hh, Math.min(foot, surface));
  const depth = foot - top;
  if (depth <= 0.5) return;
  ctx.save();
  const body = new Path2D();
  body.rect(x - hw, top, hw * 2, depth);
  ctx.clip(body);
  const fill = ctx.createLinearGradient(0, foot, 0, top);
  fill.addColorStop(0, rgba(PALETTE.ember, 0.55));
  fill.addColorStop(0.75, rgba(PALETTE.ember, 0.8));
  fill.addColorStop(1, rgba(PALETTE.emberRim, 0.9));
  ctx.fillStyle = fill;
  ctx.fill(body);
  // The glass's curve through the fluid: a lit stripe down one side, a deep
  // one down the other, so the column is round.
  const round = ctx.createLinearGradient(x - hw, 0, x + hw, 0);
  round.addColorStop(0, rgba(PALETTE.emberRim, 0.25));
  round.addColorStop(0.25, rgba(PALETTE.emberRim, 0));
  round.addColorStop(0.7, rgba(PALETTE.sheenDeep, 0));
  round.addColorStop(1, rgba(PALETTE.sheenDeep, 0.45));
  ctx.fillStyle = round;
  ctx.fill(body);
  // The bubbles, rising from the foot and gone at the surface.
  const rise = RISE + RISE_STRAIN * strain;
  ctx.strokeStyle = PALETTE.emberRim;
  ctx.fillStyle = rgba(PALETTE.text, 0.25);
  ctx.lineWidth = Math.max(0.8, tile * 0.018);
  for (let i = 0; i < BUBBLES; i++) {
    const lap = time * rise * (0.7 + 0.6 * scatter(i, 1)) + scatter(i, 2);
    const k = lap - Math.floor(lap);
    const by = foot - k * hh * 2;
    if (by < top) continue;
    const wobble = Math.sin(time * 3 + i * 2.1) * hw * 0.08;
    const bx = x - hw * 0.75 + scatter(i, 3) * hw * 1.5 + wobble;
    const r = tile * (BUBBLE_MIN + (BUBBLE_MAX - BUBBLE_MIN) * scatter(i, 4)) * (0.6 + 0.4 * k);
    const b = new Path2D();
    b.arc(bx, by, r, 0, Math.PI * 2);
    ctx.fill(b);
    ctx.stroke(b);
  }
  // A froth of small bubbles riding the surface.
  ctx.fillStyle = rgba(PALETTE.text, 0.5);
  for (let i = 0; i < 5; i++) {
    const drift = scatter(i, 5) + time * 0.07 * (i % 2 === 0 ? 1 : -1);
    const fx = x - hw * 0.8 + (drift - Math.floor(drift)) * hw * 1.6;
    const froth = new Path2D();
    froth.arc(fx, top + tile * 0.05, tile * 0.03 * (0.6 + scatter(i, 6)), 0, Math.PI * 2);
    ctx.fill(froth);
  }
  ctx.restore();
}
