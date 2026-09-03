/**
 * One card's picture, at whatever the page's controls currently say.
 *
 * This file briefly held a second skin — B, beside A — so a card could draw
 * its contour twice and answer `docs/decisions.md` #24's question: does the
 * mounted texture read differently from the flat one, side by side rather
 * than by flipping. It did that job and was checked. It comes out now because
 * the owner has since said plainly what SHAPES is for: click a skin, see it
 * on all the shapes, nothing else on the card. Comparing twenty skins on one
 * body is `shapes-all.ts`'s job, on its own page — a second half squeezed
 * onto every one of sixty cards was never the right home for it, and now that
 * the real home exists the half comes off.
 *
 * What the controls say is `shapes-state.ts`, not this file. It used to be
 * here, and the axes that write it imported it from here while this file
 * re-exported the control bar that builds those axes — a runtime cycle, and
 * the reason the state is a leaf now.
 */

import type { CatalogueEntry } from "@neon-spore/shape-sheet";
import { shapeFigure } from "./shape-figure.js";
import {
  currentGlows,
  currentHits,
  currentLit,
  currentMotion,
  currentSkin,
  currentTails,
} from "./shapes-state.js";

/**
 * The whole control row, built once above the drafts and read by
 * `shapes-all.ts`'s three grids besides. Its own file, `shapes-controls.ts`,
 * because the group headings and independence-of-the-other-axes wording it
 * needs are a page concern, not a "what is this card wearing" one.
 */
export { controlBar } from "./shapes-controls.js";

export interface PictureOptions {
  box: number;
  /** The frame's width — `box` for a square card, wider for a long shape. */
  width: number;
  stroke: string;
}

/** The card's picture: one figure, at the skin, light and motion the page's
 * controls currently say. */
export function picture(entry: CatalogueEntry, o: PictureOptions): Element {
  return shapeFigure(entry, {
    box: o.box,
    width: o.width,
    stroke: o.stroke,
    skin: currentSkin(),
    lit: currentLit(),
    motion: currentMotion(),
    glows: currentGlows(),
    hits: currentHits(),
    tails: currentTails(),
  });
}
