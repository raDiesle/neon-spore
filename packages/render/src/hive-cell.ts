import { rgba } from "./hex.js";
import { faded } from "./hive-wax.js";
import { PALETTE } from "./palette.js";

/**
 * **THE HIVE's lobes and breaches, as wax** (`hive-wax.ts` is the mass):
 * a lobe is a drop of wax hung off the underside, shaded from its upper left,
 * its lower wall lit from inside in `rim` and a wet point on it; a breach is
 * a wet socket opened in that lobe — dark, the lip's shadow over its top,
 * its colour welling up from the floor and its floor lit in its rim. Neither
 * has a line drawn round it (`new-boss-more` §6.3).
 *
 * **Every width is off the tile.**
 */

/** A lobe of `hex` at `fillA`, centred on `c` with radius `r`, lit inside its lower wall in `rim` at `rimA`. */
export function paintLobe(
  ctx: CanvasRenderingContext2D,
  p: Path2D,
  x: number,
  y: number,
  r: number,
  tile: number,
  hex: string,
  fillA: number,
  rim: string,
  rimA: number,
  fade: number,
): void {
  ctx.save();
  ctx.globalAlpha = fillA;
  ctx.fillStyle = faded(hex, fade);
  ctx.fill(p);
  ctx.globalAlpha = 1;
  ctx.clip(p);
  const shade = ctx.createRadialGradient(x - r * 0.4, y - r * 0.2, 0, x, y, r * 1.4);
  shade.addColorStop(0, rgba(PALETTE.sheenRim, 0.18 * fade));
  shade.addColorStop(0.35, rgba(PALETTE.sheenRim, 0));
  shade.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.45 * fade));
  ctx.fillStyle = shade;
  ctx.fill(p);
  ctx.lineJoin = "round";
  cut(ctx, p, y + r * 0.2, y + r * 4, tile * 0.1, faded(rim, fade), rimA);
  ctx.restore();
  wet(ctx, x - r * 0.4, y - r * 0.05, Math.max(0.8, tile * 0.03), 0.7 * fade);
}

/**
 * A breach: the socket `hole` sunk in its lobe, dark, `hex` welling in it at
 * `pulse`, the lip's shadow over its top and its floor lit in `rim`.
 */
export function paintBreach(
  ctx: CanvasRenderingContext2D,
  hole: Path2D,
  x: number,
  y: number,
  r: number,
  tile: number,
  hex: string,
  rim: string,
  fade: number,
  pulse: number,
): void {
  ctx.save();
  ctx.fillStyle = faded(PALETTE.sheenDeep, fade, 0.85);
  ctx.fill(hole);
  ctx.globalAlpha = 0.85 + 0.15 * pulse;
  ctx.fillStyle = faded(hex, fade);
  ctx.fill(hole);
  ctx.globalAlpha = 1;
  ctx.clip(hole);
  const well = ctx.createRadialGradient(x, y + r * 0.35, 0, x, y, r * 1.2);
  well.addColorStop(0, rgba(PALETTE.sheenDeep, 0));
  well.addColorStop(1, rgba(PALETTE.sheenDeep, 0.3 * fade));
  ctx.fillStyle = well;
  ctx.fill(hole);
  ctx.lineJoin = "round";
  cut(ctx, hole, y - r * 3, y - r * 0.15, tile * 0.07, faded(PALETTE.sheenDeep, fade), 0.5);
  cut(ctx, hole, y + r * 0.2, y + r * 3, tile * 0.08, faded(rim, fade), 0.7 + 0.3 * pulse);
  ctx.restore();
  wet(ctx, x - r * 0.45, y + r * 0.3, Math.max(0.7, tile * 0.025), 0.6 * fade);
}

/** A hard wet point. */
function wet(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, a: number): void {
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, a);
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
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
