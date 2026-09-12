import { type Color, crystalHeld, crystalMiddleCol, crystalUnder, spanOf } from "@neon-spore/sim";
import type { Body } from "./creature-body-in.js";
import { contourClock } from "./creature-place.js";
import { CANOPY_R, drawCanopy, drawCraftHull, drawEnginePod, HULL_RY } from "./crystal-craft.js";
import { drawCrystalField } from "./crystal-field.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { tileCX } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * THE CRYSTAL: a craft three tiles wide crossing the field on the carom's
 * diagonal, an electric field crawling round the whole of it, and a canopy
 * over the middle in the one colour that opens it.
 *
 * The parts are in `crystal-craft.ts` — the hull is `SHELL`, the contour
 * nothing else draws, stretched into a saucer; the two ends are engine pods,
 * red left and cyan right — and the field in `crystal-field.ts`. This file
 * is the order they go on in and the one reading of the world they share.
 *
 * **What the picture has to say**, in order of how far away it reads:
 * 1. the field is whole: arcs all the way round, and nothing gets through;
 * 2. the ship's shield stands under the craft — under *any* of its three
 *    lanes (`crystalUnder`) — and a green column runs from the plate up to
 *    it, the clasp's own link drawn out in full, with the ship's arcs
 *    growing on the same frame (`claspResonanceIn`);
 * 3. the guard is armed too (`crystalHeld`) and the field breaks open across
 *    the underside, the broken ends sparking either side of the middle —
 *    that hole is the beat the shot has to land in;
 * 4. the canopy over the middle wears the join's colour, brighter through
 *    the hole: the one tile, in the one colour, on both screens.
 */

/** The hull's reach past the outer lanes, as a share of a tile each side. */
const HULL_PAD = 0.18;
/** The field's clearance outside the hull, as a share of a tile. */
const FIELD_PAD = 0.22;
/** The field's half-height, as a share of a tile: over the canopy and under
 * the pods. */
const FIELD_RY = 0.66;

function joinColor(color: Color | null): { hex: string; rim: string } {
  return color === "cyan"
    ? { hex: PALETTE.cyan, rim: PALETTE.cyanRim }
    : { hex: PALETTE.red, rim: PALETTE.redRim };
}

export function drawCrystalBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, near } = b;
  const cfg = world.cfg;
  const tile = l.tile;
  const span = spanOf(c);
  const middle = crystalMiddleCol(c);
  const under = crystalUnder(world, c);
  const held = crystalHeld(world, c);
  const heldMul = held ? 1 : 0;

  // The link first, under everything: a column of the shield's own green from
  // the hull up to the craft, in the *shield's* lane — the body glides between
  // columns over a beat and the shield does not, and the light is the
  // shield's answer, so the craft is seen arriving over it.
  if (under) {
    const lx = tileCX(l, world.shieldCol);
    const green = hazed(cfg, PALETTE.claspShield, near);
    const g = ctx.createLinearGradient(lx, y, lx, l.hullY + tile * 0.5);
    g.addColorStop(0, "rgba(67,196,85,0.34)");
    g.addColorStop(0.6, "rgba(67,196,85,0.12)");
    g.addColorStop(1, "rgba(67,196,85,0.3)");
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.fillStyle = g;
    ctx.fillRect(lx - tile * 0.16, y, tile * 0.32, l.hullY + tile * 0.5 - y);
    ctx.restore();
    halo(ctx, lx, y + tile * 0.5, tile * 0.7, green, 0.5 + 0.3 * heldMul);
  }

  const halfW = (span / 2 + HULL_PAD) * tile;
  const metal = hazed(cfg, PALETTE.rock, near);
  const dark = hazed(cfg, PALETTE.rockDark, near);
  const rim = hazed(cfg, PALETTE.hullRim, near);
  const red = { hex: hazed(cfg, PALETTE.red, near), rim: hazed(cfg, PALETTE.redRim, near) };
  const cyan = { hex: hazed(cfg, PALETTE.cyan, near), rim: hazed(cfg, PALETTE.cyanRim, near) };
  const podDark = hazed(cfg, PALETTE.rockDark, near);

  // Pods behind the hull's edge, then the hull over their inner halves, then
  // the canopy standing on the deck.
  drawEnginePod(ctx, x, y, tile, -1, red.hex, red.rim, podDark, time, c.id * 2);
  drawEnginePod(ctx, x, y, tile, 1, cyan.hex, cyan.rim, podDark, time, c.id * 2 + 1);
  const t = contourClock(c.id, time);
  drawCraftHull(ctx, x, y, halfW, tile, t, { metal, dark, rim }, heldMul);
  const jc = joinColor(c.color);
  drawCanopy(ctx, x, y, tile, hazed(cfg, jc.hex, near), hazed(cfg, jc.rim, near), heldMul);

  // The field last, round all of it. The hole is as wide as the middle tile,
  // measured on the ellipse's underside: the canopy's own width and a little.
  const rx = halfW + FIELD_PAD * tile;
  const ry = FIELD_RY * tile;
  const gapHalf = Math.asin(Math.min(0.95, (tile * (CANOPY_R + 0.32)) / rx));
  drawCrystalField(ctx, x, y, rx, ry, time, held, gapHalf, hazed(cfg, PALETTE.crystalField, near));
  // A body over the middle lane wears a little more light there: the hole in
  // the field frames the tile a bolt goes up.
  if (held) halo(ctx, tileCX(l, middle), y + tile * HULL_RY, tile * 0.6, jc.hex, 0.3);
}
