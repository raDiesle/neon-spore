import { HULL_RY } from "./crystal-craft.js";
import { halo } from "./glow.js";

/**
 * THE CRYSTAL's keel: the join's colour on the **underside** of the middle,
 * which is the side the shot comes from.
 *
 * The owner, 17 September 2026: *"Right now middle top is only red or cyan,
 * but we need to also colour the bottom of the ship middle in the same colour,
 * because it is where the cannon must hit."* The canopy says which colour opens
 * the craft (`drawCanopy`) and it says it on the roof — to a player at the
 * bottom of their own screen, aiming up a column, the one fact the picture has
 * to tell them was the one fact they could not see from where they were.
 *
 * So the same join, drawn the other way up: a port on the belly of the middle
 * tile, the mirror of the canopy about the deck line and on the same clock —
 * both swell and brighten together while the whole condition holds, because
 * they are two faces of one thing and a pair calling it needs them to read as
 * one.
 *
 * **It is light coming out, not a surface lit.** The craft is lit from above
 * (`drawCraftHull`'s gradient) and its belly is the shadowed side, so a port
 * painted there as a lit dome would read as a mistake in the lighting. The
 * gradient runs the other way — brightest at the lowest point, falling back
 * into the hull — and it is drawn under `lighter`, which is how every other
 * emissive part of this craft is drawn (`drawEnginePod`'s exhaust).
 */

/** The port's half-width, as a share of a tile. Wider than the canopy's
 * `CANOPY_R`: it is read from further down the field and at a flatter angle. */
export const KEEL_R = 0.38;
/**
 * How deep it hangs, as a share of that width. A half-circle was the first
 * drawing and it cost a round: under the canopy's own dome, with both halos
 * additive over a dark hull, the two read as one red ball skewered through the
 * saucer and the craft stopped being a craft. Flat, it is a port in a belly.
 */
const KEEL_FLAT = 0.6;

/**
 * The port under the middle. `x`, `y` are the craft's centre; `held` is 1 while
 * the field stands broken open, exactly as the canopy takes it.
 */
export function drawKeelPort(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  hex: string,
  rim: string,
  held: number,
): void {
  const rx = tile * KEEL_R * (1 + 0.2 * held);
  const ry = rx * KEEL_FLAT;
  // Hung off the bottom of the saucer, not off the deck line the canopy
  // stands on: mirroring the canopy exactly put the two within a third of a
  // tile of each other and they read as one ball through the middle of the
  // hull. A band of dark plating between them is what makes this one a port
  // *under* something.
  const bot = y + tile * HULL_RY * 0.92;
  halo(ctx, x, bot + ry * 0.5, rx * (1.5 + 1.1 * held), hex, 0.3 + 0.45 * held);
  ctx.save();
  // The port: the canopy's dome turned over and pressed flat, so the pair see
  // the same shape whichever screen they are on.
  ctx.beginPath();
  ctx.ellipse(x, bot, rx, ry, 0, 0, Math.PI);
  ctx.closePath();
  const g = ctx.createLinearGradient(x, bot, x, bot + ry);
  g.addColorStop(0, hex);
  g.addColorStop(0.5, hex);
  g.addColorStop(1, rim);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2 + 0.8 * held;
  ctx.stroke();
  // The lip where the port meets the deck: the one hard edge on a shape that
  // is otherwise all glow, and what keeps it from reading as a smear at a
  // tile's size.
  ctx.globalCompositeOperation = "lighter";
  ctx.strokeStyle = rim;
  ctx.globalAlpha = 0.8;
  ctx.lineWidth = 1 + 0.6 * held;
  ctx.beginPath();
  ctx.moveTo(x - rx * 0.92, bot);
  ctx.lineTo(x + rx * 0.92, bot);
  ctx.stroke();
  ctx.restore();
}
