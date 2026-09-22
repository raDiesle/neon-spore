import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import type { Aim } from "./slow-intake-aim.js";
import type { SlowWindow } from "./slow-look.js";

/**
 * **`drain`'s bar, drawn under the boss, because that is where the owner
 * asked for it.**
 *
 * A notched bar as wide as the window when it opens and closed to a point on
 * the beat the window shuts, one notch swallowed per beat. It is the only
 * thing in the game a pair can *read* a window off, and since 22 September
 * 2026 what it measures is **the time left to answer the step**, not a rest
 * between steps: the window and the asking are now the same span
 * (`sim/slow.ts` `closeSlow`), so the bar empties towards the strike.
 *
 * **It hangs below the body rather than above the hull.** The owner, the same
 * day: *i asked to show this progress bar more near the boss*. A measure of
 * how long the pair has to move a part of that body belongs beside the body,
 * where the eyes already are — on the hull it was a third place to look,
 * after the marks and the cue.
 *
 * **It does not swing with the body.** THE INSTAR travels (`instar-sway.ts`)
 * and a measure that travels is a measure that has to be found again every
 * beat, so the bar keeps the field's middle and takes only its *height* from
 * the boss. The floor is where it used to stand: a body low in the field
 * cannot push the measure down into the hull.
 *
 * It is a sibling rather than the same file as the streams because the two are
 * separable arguments about one field: this one says *how long*, the streams
 * say *where*. Together they are the whole of what the owner asked for on 22
 * September 2026 — the bar kept from `drain`, the light moved onto the boss.
 */

/** How wide the bar stands at the open, as a share of the field's width, and
 * how thick, how tall a notch is and how far above the hull it may float at
 * the lowest, in tiles. All four are `drain`'s own figures. */
const SPAN = 0.62;
const THICK = 0.1;
const NOTCH = 0.26;
const LIFT = 0.55;

/** Tiles below the body's own edge the bar hangs, clear of its skin. */
const UNDER = 0.7;

/**
 * The most notches the bar will ever carry **per side**, whatever the window
 * is worth — `drain` mirrors them out of the middle, so the drawn count is
 * twice this.
 *
 * `drain` was drawn against a window of a few beats and put a notch on every
 * one. A choreographed window is around twenty-four (`content/instar-script.ts`),
 * and forty-six notches across two thirds of a phone is a comb: the marks
 * merge into a hatched band and the pair can read neither *how many* nor
 * *how fast*. So the beats are grouped — one notch every `stride` of them,
 * the stride the smallest that keeps the count at five a side or under — and
 * what the eye gets back is a bar with countable divisions that still closes
 * at the rate the beats do.
 */
const NOTCHES = 5;

/** Draws the window's own measure under the body it is about. */
export function drawBar(ctx: CanvasRenderingContext2D, l: Layout, win: SlowWindow, at: Aim): void {
  const rest = win.beats <= 0 ? 0 : win.left / win.beats;
  if (rest <= 0) return;

  const half = (l.gridWidth * SPAN * rest) / 2;
  const mid = l.gridLeft + l.gridWidth / 2;
  const thick = l.tile * THICK;
  const y = Math.min(at.y + at.r + l.tile * UNDER, l.hullY - l.tile * LIFT);

  ctx.save();
  ctx.fillStyle = rgba(PALETTE.hull, 0.5);
  ctx.fillRect(mid - half, y - thick / 2, half * 2, thick);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.fillRect(mid - half, y - thick / 6, half * 2, thick / 3);

  // A notch every `stride` beats, standing where that beat's edge was when the
  // bar was whole, so what shrinks past one is beats gone rather than a bar
  // moving.
  const notch = l.tile * NOTCH;
  const full = (l.gridWidth * SPAN) / 2;
  const stride = Math.max(1, Math.ceil(win.beats / NOTCHES));
  for (let beat = stride; beat < win.beats; beat += stride) {
    const at = beat / win.beats;
    if (at > rest) continue;
    for (const side of [-1, 1]) {
      const x = mid + side * full * at;
      ctx.fillRect(x - thick / 2, y - notch / 2, thick, notch);
    }
  }
  ctx.restore();
}
