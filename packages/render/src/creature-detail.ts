import { haloSprite } from "./glow.js";
import type { Layout } from "./layout.js";

/** Core and trailing filaments. Inner drawing is thinner than the outline
 * (docs/spec/graphics.md). */
export function drawDetails(
  ctx: CanvasRenderingContext2D,
  isBulb: boolean,
  rx: number,
  ry: number,
  rim: string,
): void {
  ctx.fillStyle = rim;
  if (isBulb) {
    ctx.beginPath();
    ctx.arc(0, ry * 0.3, ry * 0.09, 0, Math.PI * 2);
    ctx.fill();
    return;
  }
  ctx.beginPath();
  ctx.arc(-rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(rx * 0.12, ry * 0.2, ry * 0.07, 0, Math.PI * 2);
  ctx.fill();
}

/** How many puffs the plume is made of, how far the last one stands above the
 * body in body-heights, and how far each one drifts sideways. */
const PUFFS = 3;
const REACH = 1.8;
const CURL = 0.3;

/**
 * The trail a living body leaves as it falls: a plume that widens and
 * dissipates above it.
 *
 * **This was two fading halos and it is a plume now**, because a slick and a
 * bulb are wet things. Every other tail in this game narrows away — the
 * torch's wedge, the shot's streak — because each is drawing the *path* a
 * thing took; a plume is not a path, it is what the path did to the water
 * around it, and it spreads. The two halos it replaces were made of the same
 * sprite the body already wears, so they said *this thing glows* a second time
 * rather than *this thing is moving*, and two steps of a quarter tile is less
 * than one body-height of tail at that.
 *
 * Chosen off the SHAPES tab's TAIL axis, where it had been drawn as a proposal
 * against the shipped halos and four others (`tools/director/src/tails/`).
 *
 * **Upward, because a row only grows toward the hull** — the fall is implied
 * by what is behind, not by moving anything. Three overlapping ellipses,
 * stepped up and out and fainter each time; each drifts at its own lag so the
 * column curls rather than standing up like a chimney.
 *
 * **The soft edge comes from the baked halo sprite and not from a gradient.**
 * A puff wants a falloff, and a `createRadialGradient` per puff per body per
 * frame is three gradients built every frame for every creature on the field.
 * `haloSprite` is cached on colour and radius (`glow.ts`), so the whole plume
 * is three blits and one `save`. It is drawn through `drawImage`'s own width
 * and height rather than through `halo`, because that is where the ellipse
 * comes from: stretching the destination rectangle costs nothing, where a
 * scaled transform would cost a `save` and a `restore` for every puff.
 */
export function drawMotionTrail(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  x: number,
  y: number,
  r: number,
  hex: string,
  t: number,
): void {
  const sprite = haloSprite(hex, Math.max(2, Math.round(r)));
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let k = 1; k <= PUFFS; k++) {
    const up = (k / PUFFS) * REACH;
    const px = x + Math.sin(t * 0.9 - k * 0.6) * r * CURL * k;
    const py = y - l.tile * up * 0.5;
    const wide = r * (0.55 + k * 0.3) * 2;
    const tall = r * (0.5 + k * 0.22) * 2;
    ctx.globalAlpha = (1 - k / (PUFFS + 1)) * 0.22;
    ctx.drawImage(sprite, px - wide / 2, py - tall / 2, wide, tall);
  }
  ctx.restore();
}
