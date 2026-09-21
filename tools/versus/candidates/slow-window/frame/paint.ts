import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/**
 * A frame that closes on the field for as long as the window is open.
 *
 * Four bars stand inside the edge of the play area, nothing at the moment the
 * window opens and thickest on the beat it shuts. The picture is the walls
 * coming in: the pair are not being asked to read a number, they are being
 * shown that there is less room than there was, and the frame stops growing at
 * the same instant the game comes back up to speed.
 *
 * **It spends beats and not seconds.** `win.through` runs at the rate the
 * *beats* do, which is the rate the pair are hearing and a third of the wall
 * clock — a frame closing on `view.time` would be a second clock disagreeing
 * with the music (`slow-look.ts`).
 *
 * **How it can lose.** A rectangle inside a rectangle is the shape of chrome:
 * a phone that already has a radar strip and a control band may read this as
 * one more piece of furniture rather than as pressure, and it is the answer
 * here with the least to say about *where* the hurry is — the whole field is
 * squeezed equally, including the half nothing is happening in. It is also the
 * one that costs the field real room at the moment there is most to see in it.
 */

/** How thick the bars stand on the beat it shuts, as a share of the play area. */
const THICK = 0.055;

/** The alpha at the open and at the shut. It arrives faint and ends stated. */
const FAINT = 0.1;
const FULL = 0.34;

/**
 * The corner bite, as a share of the bar's own thickness: the top and bottom
 * bars run the full width and the sides stop short of them, so the four meet
 * as a mitre rather than doubling up at the corners where two alphas would
 * stack into a brighter square than the run of the bar.
 */
const MITRE = 1;

export const closingFrame: SlowLook["paint"] = (ctx, l, _world, _view, win) => {
  // Squared, so the first beat of the window is nearly clear and the closing
  // is felt at the end — an even slide reads as a wipe rather than a squeeze.
  const shut = win.through * win.through;
  const thick = Math.max(1, l.playHeight * THICK * shut);
  const top = l.gridTop;
  // The hull and not the band: the field the pair are looking at ends at the
  // hull line, and everything below it is drawn over this pass anyway.
  const bottom = l.hullY;
  const height = bottom - top;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hullRim, FAINT + (FULL - FAINT) * shut);
  ctx.fillRect(l.gridLeft, top, l.gridWidth, thick);
  ctx.fillRect(l.gridLeft, bottom - thick, l.gridWidth, thick);
  const inset = thick * MITRE;
  const side = Math.max(0, height - inset * 2);
  ctx.fillRect(l.gridLeft, top + inset, thick, side);
  ctx.fillRect(l.gridLeft + l.gridWidth - thick, top + inset, thick, side);
  ctx.restore();
};
