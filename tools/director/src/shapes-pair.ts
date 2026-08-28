/**
 * What every card on the SHAPES tab is wearing: one skin, one light, one
 * forced motion, for the whole page rather than per card.
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
 * `shapes-all.ts` still needs to know what the page's controls currently say
 * — a skin grid is read against whatever light and motion the bar is set to,
 * same as a motion grid is read against whatever skin is picked — so the
 * three getters at the bottom are exported for it. Nothing else outside this
 * file may write these three; the three setters just below them are the only
 * way, and `controlBar` — now in `shapes-controls.ts`, re-exported here so
 * `shapes-panel.ts` keeps importing it from this file — is the only caller.
 */

import type { OwnMotion } from "@neon-spore/content";
import type { CatalogueEntry } from "@neon-spore/shape-sheet";
import { shapeFigure } from "./shape-figure.js";
import type { SkinId } from "./skins/index.js";

/**
 * Which skin every card is wearing. MEMBRANE rather than LINE, because the
 * outline is the control and a control is switched *to*.
 */
let skinA: SkinId = "membrane";

/**
 * Whether the key light is on, for every card at once — orthogonal to the
 * skins. It was once a skin among the others, satisfied by clicking CORE. TURN
 * and CRATER end that: they compose the light into a different base texture,
 * so switching away to see one unlit compares two textures rather than the
 * light.
 */
let lit = true;

/**
 * Which own-motion drives every card, overriding each card's own. `undefined`
 * is a real choice ("OWN") and not the absence of one — it is the behaviour
 * before this bar existed, and it is the default so nothing moves differently
 * until something is picked.
 */
let motion: OwnMotion | undefined;

/** What actually drives a card, so a caption can name it rather than guess. */
export function driving(entry: CatalogueEntry): OwnMotion | undefined {
  return motion ?? entry.motion;
}

/** The skin the whole page is currently wearing. */
export function currentSkin(): SkinId {
  return skinA;
}

/** Whether the key light is currently on. */
export function currentLit(): boolean {
  return lit;
}

/** The motion currently forced on every card, or `undefined` for OWN. */
export function currentMotion(): OwnMotion | undefined {
  return motion;
}

/** Sets the whole page's skin. The only writer besides `controlBar` itself. */
export function setSkin(id: SkinId): void {
  skinA = id;
}

/** Flips the key light for the whole page. */
export function toggleLit(): void {
  lit = !lit;
}

/** Forces (or, given `undefined`, releases back to OWN) the motion driving
 * every card. */
export function setMotion(m: OwnMotion | undefined): void {
  motion = m;
}

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
    skin: skinA,
    lit,
    motion,
  });
}
