import type { Creature } from "@neon-spore/sim";
import { type Interior, interiorFor } from "./body-interior.js";
import { halo, haloSprite } from "./glow.js";
import type { Layout } from "./layout.js";
import { plateLightShift } from "./shell-draw.js";

/**
 * What this body has inside it, through the record for its kind.
 *
 * The marks themselves moved to `body-interior.ts` on 9 September 2026, where
 * a second answer to them can sit: the slick and the bulb are on more waves
 * than anything else and their whole interior was three dots. Nothing about
 * what is drawn changed in that move. The kind is passed rather than an
 * `isBulb`, because there are three records now and the third is every other
 * blob's — a candidate on the slick must not quietly redraw a dart.
 */
export function drawDetails(ctx: CanvasRenderingContext2D, kind: string, p: Interior): void {
  interiorFor(kind).paint(ctx, p);
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

/**
 * The two marks a body makes in its own colour that are not part of its
 * contour — the plume above it and the halo around it — and the one thing that
 * can stop them.
 *
 * They are here together rather than at the end of `drawLiving` because they
 * share a rule that the contour does not: **armour damps them.** A shell wears
 * opaque dead plating, and until 9 September 2026 both were drawn straight
 * through it, so a red plume stood in the air above a plate that is supposed
 * to give off nothing at all. `plateLightShift` is where the body's light is
 * allowed to be — nowhere while both plates are on, over the opened half while
 * one is, and back in the middle once the body is bare (`shell-draw.ts`). Zero
 * for every other kind, which is every body but one.
 *
 * Screen space, outside the body's own transform: neither mark takes the
 * creature's lean, its strain or its squash with it.
 */
export function drawOwnLight(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  c: Creature,
  x: number,
  y: number,
  ox: number,
  oy: number,
  r: number,
  hex: string,
  t: number,
): void {
  const open = plateLightShift(c, r);
  if (open === null) return;
  drawMotionTrail(ctx, l, x + open, y, r, hex, t);
  halo(ctx, x + ox + open, y + oy, r * 1.9, hex, 0.16);
}
