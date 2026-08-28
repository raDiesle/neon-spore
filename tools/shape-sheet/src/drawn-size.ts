// Deliberately reaching into the director rather than re-deriving its
// arithmetic: `FIT_TIMES` and `isWide` are `shape-figure.ts`'s, and
// `tilePixels`/`transformedBounds` are `shapes-motion.ts`'s — the same scan
// over a whole wobble and a whole own-motion that decides what a card on the
// SHAPES tab actually draws. A floor measured against a second copy of that
// scan is a floor about nothing: it would drift from the picture the moment
// either changed, silently, which is exactly what this file exists to catch
// instead of repeat. `tools/director/src/` is not this lane's to edit, only
// to call — see `CLAUDE.md`.
import { FIT_TIMES, isWide } from "../../director/src/shape-figure.js";
import { type Centre, tilePixels, transformedBounds } from "../../director/src/shapes-motion.js";
import type { CatalogueEntry } from "./catalogue.js";
import { boundsOver } from "./metrics.js";

/**
 * The 20–26 px floor `docs/spec/graphics.md` sets for a body to stay
 * nameable, and the drawn size to hold it against.
 *
 * `docs/spec/graphics.md`: "Object size 20–26 px (at 11 px nothing of a
 * figure survives)".
 */
export const FLOOR_LO = 20;
export const FLOOR_HI = 26;

export { isWide };

/** A body's drawn extent at one frame, long axis first. */
export interface DrawnSize {
  long: number;
  short: number;
}

/**
 * The padding `shapeFigure` reserves inside its frame before fitting the
 * body into what remains — `Math.max(6, box * 0.18)` in
 * `tools/director/src/shape-figure.ts`, restated here because that function
 * fits and draws in one motion and has nothing smaller to call. It is a
 * constant clamp on a linear scale, not a scan that can silently drift the
 * way the fit itself can, so restating it costs little of what calling would
 * have bought.
 */
const PAD_MIN = 6;
const PAD_FRACTION = 0.18;

/**
 * The drawn long and short axis of a catalogue entry's body, in CSS pixels,
 * at the frame `shapeFigure` fits it into — `box` its height and the pad
 * basis, `width` its width, defaulting to `box` for the square card every
 * entry gets unless `isWide` says otherwise (`tools/director/src/
 * shapes-panel.ts`). Passing a narrower `width` than `box` is how a card is
 * asked what it would draw if only its row got tighter — the paired-cards
 * lane's own question, and the reason `width` is a second, independent input
 * rather than folded into one square number: `shapeFigure`'s pad is `box *
 * 0.18`, so narrowing only `width` narrows the picture without shrinking the
 * margin it is judged inside.
 *
 * The *scale* is fitted to the whole sway: `transformedBounds` is the box a
 * body needs across its own-motion so a card never clips mid-swing, and that
 * box is what `shapeFigure` fits into the frame. But the size worth marking
 * against a nameability floor is what the body actually draws *at rest* —
 * the still pose, `boundsOver`'s box — through that same scale. A shape that
 * sways wide is fit small so its swing never leaves the card, and it is
 * exactly that shape whose resting body reads smaller than the frame
 * suggests; scoring the swing's own box instead would hide the one case this
 * floor exists to catch.
 *
 * The frame is an input, never assumed: the paired-cards lane's entire
 * finding was a number that changed when the frame did, and a function that
 * hardcoded 92 would answer a question nobody will ask twice.
 */
export function drawnSize(entry: CatalogueEntry, box: number, width = box): DrawnSize {
  const still = boundsOver(entry.subject, FIT_TIMES);
  const tile = tilePixels(still);
  const pivot: Centre = { x: (still.x0 + still.x1) / 2, y: (still.y0 + still.y1) / 2 };
  const fit = transformedBounds(entry.subject, entry.motion, FIT_TIMES, tile, pivot);
  const pad = Math.max(PAD_MIN, box * PAD_FRACTION);
  const scale = Math.min((width - pad) / (fit.x1 - fit.x0), (box - pad) / (fit.y1 - fit.y0));
  const a = (still.x1 - still.x0) * scale;
  const c = (still.y1 - still.y0) * scale;
  return a >= c ? { long: a, short: c } : { long: c, short: a };
}
