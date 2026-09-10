// Deliberately reaching into the director rather than re-deriving its
// arithmetic: `figureLayout` is `shape-fit.ts`'s — the same scan over a whole
// wobble and a whole own-motion, fitted with the same pad, that decides what a
// card on the SHAPES tab actually draws — and `restBounds` is the rest pose's
// box that scan remembers. A floor measured against a second copy of that fit
// is a floor about nothing: it would drift from the picture the moment either
// changed, silently, which is exactly what this file exists to catch instead
// of repeat. Until 10 September 2026 this file *was* that second copy: it
// called `boundsOver` and `transformedBounds` itself, restated the pad, and
// handed the scan no long axis where the card's fit passes one.
import { figureLayout, isWide, restBounds } from "../../director/src/shape-fit.js";
import type { CatalogueEntry } from "./catalogue.js";

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
 * The *scale* is fitted to the whole sway: `figureLayout` fits the box a body
 * needs across its own-motion so a card never clips mid-swing. But the size
 * worth marking against a nameability floor is what the body actually draws
 * *at rest* — `restBounds`' box — through that same scale. A shape that sways
 * wide is fit small so its swing never leaves the card, and it is exactly
 * that shape whose resting body reads smaller than the frame suggests;
 * scoring the swing's own box instead would hide the one case this floor
 * exists to catch.
 *
 * The frame is an input, never assumed: the paired-cards lane's entire
 * finding was a number that changed when the frame did, and a function that
 * hardcoded 92 would answer a question nobody will ask twice.
 *
 * And because it *is* the card's fit, an absolute size is invisible to it: a
 * body authored at `sizeMul: 0.2` is scaled back up to fill the same card and
 * measures exactly what the full-size one does — the SHAPES page draws THE
 * RUNT as big as THE SLICK and says `0.2× size` on the label instead. This is
 * a measure of contour, of how much of a card a resting body fills once its
 * sway is reserved, and `candidates.test.ts` holds both halves of that: a
 * flattened body reads thinner, a shrunken one reads the same.
 */
export function drawnSize(entry: CatalogueEntry, box: number, width = box): DrawnSize {
  const { scale } = figureLayout(entry, entry.motion, box, width);
  const still = restBounds(entry);
  const a = (still.x1 - still.x0) * scale;
  const c = (still.y1 - still.y0) * scale;
  return a >= c ? { long: a, short: c } : { long: c, short: a };
}
