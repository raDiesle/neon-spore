import type { World } from "@neon-spore/sim";
import { drawnRow } from "./depth.js";
import { showsGhostBody } from "./ghost.js";
import type { Layout } from "./layout.js";
import { tileCY } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * What player 1 gets instead of the body: a band across the row it is in, and
 * nothing whatever about the column.
 *
 * **The whole file is about what it must not say.** Every other half-picture
 * in this game hides one *fact* about a body that is otherwise on both screens
 * — which side a dart takes, what is inside a cloud, whether a slick is real.
 * This one hides the body, so anything drawn here that varies across the width
 * of the field is the column, given away. That rules out a gradient, a hot
 * spot, a marker at either end that is nearer one side than the other, and any
 * kind of parallax: what is left is a stripe that is identical at every x, and
 * that is exactly what this draws.
 *
 * **It is drawn the width of the whole grid and the height of a tile**, so the
 * pilot reads it the way they read a row — the thing is *there*, on that line,
 * and it is coming. Two ghosts on two rows are two bands; two on one row are
 * one, and that is honest: what player 1 is being told is which rows are
 * dangerous, and a count is a fact about columns waiting to be worked out.
 *
 * **It is colourless.** The body carries red or cyan and player 2 can see it,
 * so the colour is never anything the pair has to say — and a coloured band
 * would be one more thing on the pilot's screen that looks like it means
 * something to do. Off-white, the HUD's own, the same choice `veil-marks.ts`
 * makes for the half of its mark that is a track rather than a sentence.
 *
 * **And it tears**, on the same clock the body's camouflage does. Not
 * decoration: it is the one thing that makes the band read as *this creature*
 * rather than as a grid line, and when the pair afterwards watches the ghost
 * escape out of the top of the field in the same broken bands, the pilot has
 * seen the picture before.
 */

/** How far into the tile the band reaches, top and bottom. Just under half, so
 * two ghosts on neighbouring rows are two bands and not one thick one. */
const HEIGHT = 0.42;

export function drawGhostRows(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  beatPhase: number,
  time: number,
): void {
  for (const c of world.creatures) {
    if (c.kind !== "ghost") continue;
    // Once it is drawn on this screen the band has nothing left to say — and
    // a stripe under a body player 1 can now see would read as a second thing
    // on the row. `showsGhostBody` is the one gate, asked rather than
    // re-derived, so the band can never be up on a screen that has the body.
    if (showsGhostBody(l, world.cfg, c)) continue;
    drawBand(ctx, l, tileCY(l, drawnRow(c, beatPhase)), time + c.id * 0.37, urgency(l, c));
  }
}

/**
 * How close to the hull it is, 0 at the top of the field and 1 on the ship's
 * own row. The band brightens with it — which is *time*, and time was never
 * the secret: the pilot is being told how long they have, which is the half of
 * this creature they are meant to hold.
 */
function urgency(l: Layout, c: { row: number }): number {
  return Math.max(0, Math.min(1, c.row / Math.max(1, l.rows - 1)));
}

function drawBand(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  t: number,
  near: number,
): void {
  const h = l.tile * HEIGHT;
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  ctx.fillStyle = PALETTE.text;

  // The band itself: one flat alpha across the whole width. Deliberately a
  // fill and not a gradient — see the file's own note, a gradient is a column.
  ctx.globalAlpha = 0.09 + near * 0.14;
  ctx.fillRect(l.gridLeft, y - h / 2, l.gridWidth, h);

  // And the tears in it, three slabs of the band lit brighter and offset in
  // *height* rather than sideways. Sideways would be a position; a slab that
  // is a little taller or thinner is not.
  for (let k = 0; k < 3; k++) {
    const phase = Math.sin(t * 3.1 + k * 2.3) * Math.sin(t * 1.3 + k * 1.7);
    const band = h * (0.12 + Math.abs(phase) * 0.3);
    ctx.globalAlpha = (0.1 + near * 0.16) * Math.abs(phase);
    ctx.fillRect(l.gridLeft, y + phase * h * 0.3 - band / 2, l.gridWidth, band);
  }
  ctx.restore();
}
