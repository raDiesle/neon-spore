import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/**
 * The field goes under, and comes back up as the window runs out.
 *
 * A veil of the ground's own colour lies over the play area, deepest at the
 * top of the field and clear by the hull, and it thins as the window is spent.
 * Nothing is added to the picture: what the pair see is the far half of the
 * field sinking — the place a body is coming from goes quiet, and the place
 * they are answering in does not.
 *
 * **The band is not touched and the ship is not dimmed.** The pass is drawn
 * over every body and under the hull (`canvas2d.ts`), so the gesture the
 * window exists to buy time for keeps its full contrast while everything it is
 * being made against loses some. That is the argument of this answer in one
 * line, and it is the reason the gradient runs *out* at the hull rather than
 * lying evenly over the field.
 *
 * **How it can lose.** It dims the bodies the pair have to read. A window is
 * open at exactly the moment the field is hardest — that is what opened it —
 * and an answer that takes contrast off the marks at that moment is paying for
 * atmosphere with the one thing the slot is supposed to protect. It is also
 * the quietest of the four: on a bright wave it may not be seen at all, and a
 * picture of a window nobody notices is the state the game is in today.
 */

/** How dark the far end of the field goes at the moment the window opens. */
const DEEP = 0.62;

/** Where the veil has run out, as a share of the play area from the top. */
const CLEAR = 0.86;

/** A tint of the ship's own violet in the deep end, so it reads as a held
 * breath rather than as a screen that has lost its backlight. */
const TINT = 0.16;

/**
 * Where the veil reaches its weight, as a share of the run from the top of the
 * field. It is not nought: a veil that started at full strength would draw a
 * hard line across the field at `gridTop`, and a straight edge nobody put
 * there is the one thing a picture of a *feeling* cannot afford.
 */
const ONSET = 0.12;

export const sinkingWash: SlowLook["paint"] = (ctx, l, _world, _view, win) => {
  // It is deepest at the open and gone at the shut: the window arrives as a
  // weight and lifts, which is what the pair's own hurry does.
  const left = 1 - win.through;
  const deep = DEEP * left * left;
  if (deep <= 0) return;
  const top = l.gridTop;
  // To the hull and no further: below it is the ship's own tissue, drawn over
  // this pass, and the veil has nothing to say about a hand.
  const height = l.hullY - top;
  ctx.save();
  const grad = ctx.createLinearGradient(0, top, 0, top + height * CLEAR);
  grad.addColorStop(0, rgba(PALETTE.background, 0));
  grad.addColorStop(ONSET, rgba(PALETTE.background, deep));
  grad.addColorStop(1, rgba(PALETTE.background, 0));
  ctx.fillStyle = grad;
  ctx.fillRect(l.gridLeft, top, l.gridWidth, height);
  const violet = ctx.createLinearGradient(0, top, 0, top + height * CLEAR);
  violet.addColorStop(0, rgba(PALETTE.hull, 0));
  violet.addColorStop(ONSET, rgba(PALETTE.hull, TINT * left));
  violet.addColorStop(1, rgba(PALETTE.hull, 0));
  ctx.fillStyle = violet;
  ctx.fillRect(l.gridLeft, top, l.gridWidth, height);
  ctx.restore();
};
