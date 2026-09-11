import { livingPath, SLICK } from "@neon-spore/content";
import {
  type Color,
  crystalHeld,
  crystalMiddleCol,
  livingKindForColor,
  spanOf,
} from "@neon-spore/sim";
import { claspResonance } from "./clasp.js";
import type { Body } from "./creature-body-in.js";
import { contourClock } from "./creature-place.js";
import { hazed } from "./depth.js";
import { halo } from "./glow.js";
import { tileCX } from "./layout.js";
import { drawLiving } from "./living-draw.js";
import { PALETTE } from "./palette.js";

/**
 * THE CRYSTAL: a slick and a bulb joined at a thin middle, armoured all the
 * way round, crossing the field on the carom's diagonal.
 *
 * **Nothing here is a new shape.** The left lobe is `drawLiving` of a red
 * slick and the right lobe `drawLiving` of a cyan bulb — the two bodies it
 * breaks into, drawn by the draw they will have once it has — and the shell
 * around both is SLICK's own silhouette (`creature:slick` / `pinch`, the
 * two-lobed deep-waist contour) stretched over three tiles: an hourglass on
 * its side is what that shape already is, and the waist of it *is* the join.
 * The shell is a second border cut from that contour and drawn on top, the way
 * every armour in this game is, and it is a membrane rather than a lid because
 * the pair have to read the two bodies inside it and the colour on the join.
 *
 * **What the picture has to say**, in order of how far away it reads:
 * 1. the tile between the two lobes wears the colour the wave gave the join —
 *    the one colour a shot can open it with, on both screens;
 * 2. a light *under* the join comes on while the ship's shield stands in that
 *    lane (`claspResonance`, the clasp's own signal, so the ship's arcs grow
 *    taller on the same frame — `claspResonanceIn`), with the link drawn down
 *    the lane to the shield rather than a mark at each end;
 * 3. the join itself burns brighter while the whole condition holds — shield
 *    there *and* the guard armed (`crystalHeld`) — which is the beat the shot
 *    has to land on.
 */

/** How far each lobe's centre sits from the join, in tiles. */
const LOBE_OFFSET = 1;
/** The shell's reach past the lobes, as a share of a tile each side. */
const SHELL_PAD = 0.18;
/** The join's disc, as a share of a tile. */
const JOIN_R = 0.22;
/**
 * The shell's contour: SLICK's pinch, waisted deeper. The slick's own 0.52 is
 * cut out of a body one tile wide and reads as a bean at three; the hourglass
 * the owner asked for — "in the middle it's thin" — is the same two lobes
 * with the waist taken nearly to the join. Named `crystal:shell` here and
 * nowhere else drawn.
 */
const SHELL = { ...SLICK, depth: 0.8 };

function joinColor(color: Color | null): { hex: string; rim: string } {
  return color === "cyan"
    ? { hex: PALETTE.cyan, rim: PALETTE.cyanRim }
    : { hex: PALETTE.red, rim: PALETTE.redRim };
}

export function drawCrystalBody(b: Body): void {
  const { ctx, l, world, c, x, y, time, beats, beatPhase, near, blocked } = b;
  const cfg = world.cfg;
  const tile = l.tile;
  const span = spanOf(c);
  const middle = crystalMiddleCol(c);
  const lit = claspResonance(world.shieldCol, middle);
  const held = crystalHeld(world, c) ? 1 : 0;
  const blockedFor = blocked.get(c.id) ?? 0;

  // The link first, under everything: a column of the shield's own green from
  // the hull up to the join's row, only while the shield stands in this lane.
  // It is the clasp's connection drawn out in full — the owner's rule that a
  // coupling is drawn between the two things and not as a mark on each. In
  // the *lane's* column rather than under the drawn body: the body glides
  // between columns over a beat and the shield does not, and the light is the
  // shield's answer — the body is seen arriving into it, which is the beat.
  if (lit > 0) {
    const lx = tileCX(l, middle);
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
    // And the light under the join, the clasp's second halo one creature on.
    halo(ctx, lx, y + tile * 0.42, tile * 0.7, green, 0.5 + 0.3 * held);
  }

  // The two bodies, by the draw they will have once the shell is off — the
  // kinds `crystalStruck` will give them, through the one rule that names
  // them. The right one takes the next id so its clocks are its own.
  const left = { ...c, kind: livingKindForColor("red"), color: "red" as const };
  const right = { ...c, id: c.id + 1, kind: livingKindForColor("cyan"), color: "cyan" as const };
  const dx = LOBE_OFFSET * tile;
  drawLiving(ctx, l, left, x - dx, y, beats, beatPhase, time, blockedFor, cfg, near);
  drawLiving(ctx, l, right, x + dx, y, beats, beatPhase, time, blockedFor, cfg, near);

  // The shell: SLICK's contour, its long axis over all three tiles and its
  // waist on the join. `livingPath` gives the contour in silhouette units,
  // and the scale is taken off the width because that is the axis the shell
  // has to cover — `span` tiles plus a little past each lobe.
  const halfW = (span / 2 + SHELL_PAD) * tile;
  const sx = halfW / SHELL.rx;
  const sy = (tile * 0.78) / SHELL.ry;
  const t = contourClock(c.id, time);
  const shell = new Path2D(livingPath(SHELL, t));
  const metal = hazed(cfg, PALETTE.rock, near);
  const dark = hazed(cfg, PALETTE.rockDark, near);
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(sx, sy);
  // A faint fill so the lobes read as *inside* something, and a bright border
  // over it: the armour is the border, the fill is only the glass.
  ctx.fillStyle = dark;
  ctx.globalAlpha = 0.22;
  ctx.fill(shell);
  ctx.globalAlpha = 1;
  ctx.strokeStyle = metal;
  ctx.lineWidth = (1.6 + 0.6 * held) / Math.max(sx, sy);
  ctx.stroke(shell);
  // The second border, cut from the same contour a little inside it.
  ctx.scale(0.92, 0.88);
  ctx.globalAlpha = 0.5;
  ctx.lineWidth = 0.9 / Math.max(sx, sy);
  ctx.stroke(shell);
  ctx.restore();

  // The join: the one tile a shot can open, in the colour that opens it, on
  // both screens. Brighter while the whole condition holds — that brightness
  // is the beat.
  const jc = joinColor(c.color);
  const hex = hazed(cfg, jc.hex, near);
  const rim = hazed(cfg, jc.rim, near);
  const r = tile * JOIN_R * (1 + 0.25 * held);
  halo(ctx, x, y, r * (2.2 + 1.4 * held), hex, 0.35 + 0.45 * held);
  ctx.save();
  ctx.fillStyle = hex;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = rim;
  ctx.lineWidth = 1.2 + 0.8 * held;
  ctx.stroke();
  ctx.restore();
}
