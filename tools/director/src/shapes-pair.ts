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
 * file may write these three; the control row below is the only place they
 * change.
 */

import type { OwnMotion } from "@neon-spore/content";
import { type CatalogueEntry, MOTIONS } from "@neon-spore/shape-sheet";
import { shapeFigure } from "./shape-figure.js";
import { SKINS, type SkinId } from "./skins/index.js";

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

function button(host: HTMLElement, label: string, on: boolean, hint: string, pick: () => void) {
  const b = document.createElement("button");
  b.className = on ? "skin is-on" : "skin";
  b.textContent = label;
  b.title = hint;
  b.addEventListener("click", pick);
  host.appendChild(b);
  return b;
}

function tag(host: HTMLElement, body: string): void {
  const s = document.createElement("span");
  s.textContent = body;
  s.style.cssText =
    "font:10px 'Courier New',monospace;letter-spacing:2px;color:var(--dim);align-self:center;margin-left:10px";
  host.appendChild(s);
}

/**
 * The whole control row, built once above the drafts.
 *
 * Rebuilding every card is the whole of switching: a figure's fill, aura and
 * clip are decided when it is constructed, and mutating them in place would be
 * a second copy of `buildSkin` that has to agree with the first. That rebuild
 * once cost seven to twelve seconds; almost none of it was the rebuild. It was
 * the frame fit, rescanned per card per switch for an answer that had not
 * changed — `shape-figure.ts` remembers it now, and a switch costs about a
 * fifth of a second, so nothing here need be cleverer about which cards.
 */
export function controlBar(host: HTMLElement, rerender: () => void): void {
  host.replaceChildren();
  tag(host, "SKIN");
  for (const s of SKINS)
    button(host, s.label, s.id === skinA, s.hint, () => {
      skinA = s.id;
      rerender();
    });

  // Orthogonal to the skins: it unpicks none of them and none of them touch
  // it. One button because there is one light.
  tag(host, "·");
  button(
    host,
    "LIT",
    lit,
    "the key light, on top of whichever skin composes it — off shows the same skin without it",
    () => {
      lit = !lit;
      rerender();
    },
  );

  // Same host again: the skin is picked for the whole page and so is the
  // motion, so they read as one row of controls rather than two panels that
  // happen to sit near each other.
  tag(host, "MOTION");
  button(
    host,
    "OWN",
    motion === undefined,
    "each card keeps whatever motion its own catalogue entry was authored with",
    () => {
      motion = undefined;
      rerender();
    },
  );
  for (const m of MOTIONS)
    button(host, m.name, motion === m, m.note, () => {
      motion = m;
      rerender();
    });
}

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
