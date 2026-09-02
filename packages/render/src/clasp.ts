import type { SimConfig, World } from "@neon-spore/sim";
import { drawClaspLattice } from "./clasp-lattice.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CLASP's shield: the bubble a slick or a bulb falls inside, and the way
 * it comes apart when the ward opens it.
 *
 * The body underneath is not drawn here at all. `wornKind` already answers
 * "slick" or "bulb" for a clasp, so `creatures.ts` draws an ordinary living
 * body with its ordinary colour and its ordinary own-motion, and this file
 * lays one more object over the top of it. That is the whole reason the
 * transformation costs no pixels: when the ward lands, the thing that stops
 * being drawn is this, and what is left was already there.
 *
 * **Two ways to draw it, and the procedural one is the floor.** The
 * hand-painted frames in `assets/gallery/shield/green-shield/` are baked into
 * `assets/raster/green-shield-strip.webp` by `bun run raster:pack`, and
 * `install` hands them over once they have decoded. Until then — and forever,
 * on a host that cannot fetch it — the bubble below is drawn from a gradient
 * and an arc, and the creature works. Nothing here is behind a flag: an enemy
 * that is invisible unless an asset loaded is an enemy that kills the pair for
 * a network failure.
 *
 * The green is the owner's decision, taken with the collision named: green is
 * otherwise reserved for a Simon round answered in full. See
 * `PALETTE.claspShield`.
 */

/** The strip as laid out by `bun run raster:pack` over the green-shield frames. */
export interface ClaspSheet {
  frames: number;
  frameSize: number;
  frameMs: number;
}

export const CLASP_SHEET: ClaspSheet = { frames: 20, frameSize: 128, frameMs: 70 };

/** How far the bubble reaches past the body it holds, as a share of a tile. */
export const CLASP_RADIUS_MUL = 0.78;

/**
 * How far the radiant glow reaches past the ball, as a multiple of its radius.
 * The reference the owner attached is mostly this: the sphere is small in its
 * own picture and the light around it is not.
 */
export const CLASP_GLOW_MUL = 2.4;
const GLOW_MUL = CLASP_GLOW_MUL;

/**
 * How lit the shield is, 0 at rest and 1 while the player's own shield stands
 * in its column. The resonance the owner asked for: "the lightning bolts of
 * the shield become much taller, indicating to user that shield reacts on
 * their shield."
 *
 * It is a *number* rather than a boolean because both ends of the connection
 * read it — the bubble here and the ship's own arcs in `shield-spark.ts` — and
 * two ends reaching for each other is one signal, not two reactions.
 */
export function claspResonance(shieldCol: number, col: number): number {
  return shieldCol === col ? 1 : 0;
}

/**
 * Whether *anything* on the field is answering this shield's column — the
 * ship's half of the same link.
 *
 * A separate function from `claspResonance` above rather than a fold over it,
 * because the two ask about different objects: one is "is this body lit", the
 * other is "is the shield lit". They agree by both being `shieldCol === col`,
 * and they have to, or the two ends of the connection would light on
 * different frames.
 */
export function claspResonanceIn(world: World): number {
  for (const c of world.creatures) {
    if (c.kind === "clasp" && claspResonance(world.shieldCol, c.col) > 0) return 1;
  }
  return 0;
}

/**
 * The bubble, over a body that is already drawn. `t` is seconds, for the
 * surface's own crawl; `lit` is `claspResonance`.
 */
export function drawClaspShield(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  x: number,
  y: number,
  time: number,
  near: number,
  lit: number,
  image: CanvasImageSource | null,
): void {
  const r = l.tile * CLASP_RADIUS_MUL;
  const body = PALETTE.claspShield;
  const rim = PALETTE.claspShieldRim;

  if (image !== null) {
    // The hand-painted frames. Paced off `time`, which is the frame loop's own
    // clock and not a wall clock — the same argument `sprite-burst.ts` makes
    // at length for using a strip instead of an animated file.
    const frame = Math.floor((time * 1000) / CLASP_SHEET.frameMs) % CLASP_SHEET.frames;
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // The art is a filled orb with a bright core, and the body has to stay
    // readable through it — the colour is what player 2 has to be told before
    // the shield is anywhere near it. Additive at well under full strength is
    // what keeps it a membrane instead of a lid.
    ctx.globalAlpha = 0.55 + 0.25 * lit;
    ctx.drawImage(
      image,
      frame * CLASP_SHEET.frameSize,
      0,
      CLASP_SHEET.frameSize,
      CLASP_SHEET.frameSize,
      x - r,
      y - r,
      r * 2,
      r * 2,
    );
    ctx.restore();
  } else {
    // The floor: a lit shell. Three layers, and each one answers a clause of
    // the reference the owner attached — a wide radiant glow around the ball,
    // a body that is brightest just inside its own rim, and a honeycomb on
    // the surface of it (`clasp-lattice.ts`).
    //
    // It stays a *membrane* rather than becoming an orb, and that is not
    // timidity: the colour of the body inside is the word player 2 has to
    // hear before the pair can act, so the centre of this gradient is still
    // near-transparent however bright the rest of it gets.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    // The radiant glow, well outside the ball. Wide and faint: it is what
    // says "this thing is energised" from across a phone screen, where the
    // rim itself is a couple of pixels.
    halo(ctx, x, y, r * GLOW_MUL, hazed(cfg, body, near), 0.16 + 0.2 * lit);
    const g = ctx.createRadialGradient(x, y, r * 0.3, x, y, r);
    g.addColorStop(0, "rgba(67,196,85,0)");
    g.addColorStop(0.62, `rgba(67,196,85,${0.14 + 0.1 * lit})`);
    g.addColorStop(0.92, `rgba(67,196,85,${0.34 + 0.24 * lit})`);
    g.addColorStop(1, `rgba(182,245,192,${0.42 + 0.3 * lit})`);
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
    drawClaspLattice(ctx, x, y, r, time, lit);
  }

  // The rim, both ways: it is what reads at 26 px, where the frames' painted
  // veins have dissolved into mottling and the gradient is a soft nothing.
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.globalAlpha = 0.7 + 0.3 * lit;
  ctx.strokeStyle = hazed(cfg, rim, near);
  ctx.lineWidth = 1.4 + 0.9 * lit;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  // And a second, tighter halo while it is answering the ship's shield, so
  // the connection is visible from the other end of the column too. It sits
  // on top of the ball's own glow rather than replacing it: what changes when
  // the two line up is how hard this is burning, not whether it is lit.
  if (lit > 0) halo(ctx, x, y, r * 1.6, hazed(cfg, rim, near), 0.34 * lit);
}
