import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **What THE SCUTTLE is made of**: a slab of dark rock, lit from the upper
 * left and gone to the deep at its foot, pitted, a bevel caught along its top
 * and its lobed underside lit violet from the inside it hangs over; plates of
 * rock seated in it, each shaded with a lip of light along its top and a glint;
 * and where a plate has gone, a socket (`scuttle-plate.ts`). It is no longer a
 * grey fill with a glowing line drawn round the slab, round every plate and
 * round every socket, which is the one picture the brief rules out by name
 * (`new-boss-more` §6.3).
 *
 * Split off `scuttle-draw.ts`, which decides *what* is shown to whom — which
 * sockets are on the slab, which part hangs, which is live — so it stays about
 * the fight and this one about the material. The lock is interface and drawn
 * there as it was. Colours go in plain at the fade with the strength in the
 * alpha, so `scuttle-frame.test.ts` counts the rock, the hull's rim, the dim
 * and the live colour on the op log.
 *
 * **Every width is off the tile.**
 */

/**
 * A colour at the fade: the hex itself while the frame stands, so the frame
 * tests can count it, and an `rgba` once it is going.
 */
export function faded(hex: string, fade: number, alpha = 1): string {
  return fade >= 1 && alpha >= 1 ? hex : rgba(hex, alpha * fade);
}

/** The slab's box this frame. */
export interface Slab {
  left: number;
  right: number;
  top: number;
  bottom: number;
  tile: number;
}

/** Pits in the rock, as shares of the slab's width and height. */
const PITS: readonly (readonly [number, number])[] = [
  [0.06, 0.3],
  [0.21, 0.78],
  [0.37, 0.18],
  [0.52, 0.62],
  [0.68, 0.34],
  [0.83, 0.8],
  [0.95, 0.45],
];

export function paintSlab(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Slab,
  fade: number,
): void {
  const { left, right, top, bottom, tile } = s;
  const w = right - left;
  const h = bottom - top;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(body);
  ctx.fillStyle = faded(PALETTE.hull, fade, 0.35);
  ctx.fill(body);
  ctx.fillStyle = faded(PALETTE.rockDark, fade, 0.85);
  ctx.fill(body);
  ctx.clip(body);
  const light = ctx.createLinearGradient(left, top, left + w * 0.4, bottom + h * 0.4);
  light.addColorStop(0, rgba(PALETTE.sheenRim, 0.14 * fade));
  light.addColorStop(0.4, rgba(PALETTE.sheenRim, 0));
  light.addColorStop(0.6, rgba(PALETTE.sheenDeep, 0));
  light.addColorStop(1, rgba(PALETTE.sheenDeep, 0.4 * fade));
  ctx.fillStyle = light;
  ctx.fill(body);
  for (const [u, v] of PITS) {
    const x = left + w * u;
    const y = top + h * v;
    const r = tile * 0.07;
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = faded(PALETTE.sheenDeep, fade);
    ctx.beginPath();
    ctx.ellipse(x, y, r, r * 0.6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.globalAlpha = 0.3;
    ctx.strokeStyle = faded(PALETTE.rock, fade);
    ctx.lineWidth = Math.max(0.8, tile * 0.02);
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.15, r, r * 0.6, 0, 0.1 * Math.PI, 0.9 * Math.PI);
    ctx.stroke();
  }
  // The bevel along its top, and the underside lit from the inside it hangs
  // over: stroked wide inside the slab over one band each, never all round.
  wall(ctx, body, s, top - tile, top + h * 0.2, faded(PALETTE.rock, fade), 0.35);
  wall(ctx, body, s, bottom - h * 0.22, bottom + tile, faded(PALETTE.hull, fade), 0.45);
  ctx.restore();
  glint(ctx, left + w * 0.12, top + h * 0.14, w * 0.06, tile * 0.04, fade);
}

/** The path stroked wide inside itself, over the band from `from` to `to`. */
function wall(
  ctx: CanvasRenderingContext2D,
  body: Path2D,
  s: Slab,
  from: number,
  to: number,
  colour: string,
  a: number,
): void {
  const pad = s.tile;
  ctx.save();
  ctx.beginPath();
  ctx.rect(s.left - pad, from, s.right - s.left + pad * 2, to - from);
  ctx.clip();
  ctx.lineJoin = "round";
  ctx.lineWidth = s.tile * 0.1;
  ctx.strokeStyle = colour;
  ctx.globalAlpha = a;
  ctx.stroke(body);
  ctx.restore();
}

/** The wet film: a soft bloom and a hard point at its left end. */
export function glint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  fade: number,
): void {
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.2 * fade);
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, -0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.75 * fade);
  ctx.beginPath();
  ctx.arc(x - rx * 0.5, y, Math.max(0.6, ry * 0.6), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
