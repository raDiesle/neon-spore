import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SlowLook } from "../../../../../packages/render/src/slow-look.js";

/**
 * A measured line above the hull that closes to a point, notched a beat apart.
 *
 * The one answer in the slot that states the time left as a *quantity*: a bar
 * on the pair's own line, as wide as the window when it opens, shrinking from
 * both ends toward its middle and gone at the instant the game comes back up
 * to speed. A notch stands at every beat boundary, so the bar can be read as
 * "two" rather than as "some", and each notch is swallowed as that beat is
 * spent.
 *
 * **Above the hull and nowhere else.** The window is time the pair have to
 * answer with their hands, and their hands are at the bottom of the screen: a
 * meter up the field would be read at the moment the eye is on a body. It sits
 * a little clear of the hull so the ship's own rim is not what is shrinking,
 * and under the ship in the pass order, so nothing it draws can cover a hand.
 *
 * **How it can lose.** It is an instrument, and this game has been careful not
 * to have any: no health bar, no timer, no score. A pair who look at it are
 * looking away from the field at the one moment the field is hardest, and a
 * window that has to be *read* is a window that is not being felt — which is
 * the whole of what the slot is about.
 */

/** How wide the bar stands at the open, as a share of the field's width. */
const SPAN = 0.62;

/** How thick the bar is and how far a notch stands proud of it, in tiles. */
const THICK = 0.1;
const NOTCH = 0.26;

/** How far above the hull the bar floats, in tiles. */
const LIFT = 0.55;

export const drainingBar: SlowLook["paint"] = (ctx, l, _world, _view, win) => {
  const rest = win.beats <= 0 ? 0 : win.left / win.beats;
  if (rest <= 0) return;
  const half = (l.gridWidth * SPAN * rest) / 2;
  const mid = l.gridLeft + l.gridWidth / 2;
  const thick = l.tile * THICK;
  const y = l.hullY - l.tile * LIFT;
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hull, 0.5);
  ctx.fillRect(mid - half, y - thick / 2, half * 2, thick);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.fillRect(mid - half, y - thick / 6, half * 2, thick / 3);
  // A notch per beat boundary, each swallowed as its beat is spent: the bar
  // is read as two beats rather than as a length nobody has a unit for.
  const notch = l.tile * NOTCH;
  const full = (l.gridWidth * SPAN) / 2;
  for (let beat = 1; beat < win.beats; beat++) {
    const at = beat / win.beats;
    if (at > rest) continue;
    for (const side of [-1, 1]) {
      const x = mid + side * full * at;
      ctx.fillRect(x - thick / 2, y - notch / 2, thick, notch);
    }
  }
  ctx.restore();
};
