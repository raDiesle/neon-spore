import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **`drain`'s bar, unchanged, because the owner picked it.**
 *
 * A notched bar above the hull, as wide as the window when it opens and closed
 * to a point on the beat the game comes back up to speed, one notch swallowed
 * per beat. It is the only thing in the game a pair can *read* a window off,
 * and it sits on the line their hands are already on.
 *
 * It is a sibling rather than the same file as the streams because the two are
 * separable arguments about one field: this one says *how long*, the streams
 * say *where*. Together they are the whole of what the owner asked for on 22
 * September 2026 — the bar kept from `drain`, the light moved onto the boss.
 */

/** How wide the bar stands at the open, as a share of the field's width, and
 * how thick, how tall a notch is and how far above the hull it floats, in
 * tiles. All four are `drain`'s own figures. */
const SPAN = 0.62;
const THICK = 0.1;
const NOTCH = 0.26;
const LIFT = 0.55;

/** Draws the window's own measure above the hull. */
export function drawBar(ctx: CanvasRenderingContext2D, l: Layout, win: SlowWindow): void {
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

  // A notch a beat, standing where that beat's edge was when the bar was
  // whole, so what shrinks past one is a beat gone rather than a bar moving.
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
}
