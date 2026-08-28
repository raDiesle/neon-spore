/**
 * What every card on the SHAPES tab is wearing, and — the point of this file —
 * the option of wearing two things at once.
 *
 * The skin bar is exclusive: pick MOUNTED SCALE and SCALE is gone. So the one
 * question every skin lane landed a `Check:` about — *does the mounted one go
 * round, or does the flat one already read?* — could only be answered by
 * flipping, from memory, one look at a time. Memory is not a comparison; it is
 * a preference for whichever was seen last. `docs/decisions.md` #24 is the
 * owner's rule against exactly that: every alternative comparable in the
 * director, at the same time, without leaving the application.
 *
 * So there is a B skin beside the A skin, and a card wearing both draws its
 * contour twice. Not a blink toggle — blink is right where two looks occupy
 * the *same* pixels and differ by a colour, which is what the VERSUS pair is
 * for. Two skins differ in structure, and structure is read side by side.
 *
 * **Both halves are on one clock without arranging anything.** Every figure on
 * the page is driven by the single loop in `shape-figure.ts`, which reads
 * `performance.now()` once per frame and hands the same `t` to all of them. A
 * pair drawn from the same entry with the same motion is therefore in phase by
 * construction — if it were not, the difference being read would be phase.
 *
 * **Neither half is shrunk to make room.** Measured over the whole catalogue
 * at the 92 px card: every one of the 49 square cards draws a body at least
 * 26 px on its long axis, and halving the frame to 46 px puts 32 of those 49
 * under 26 px and 17 of them under 20 px — under the floor
 * `docs/spec/graphics.md` sets for a body to stay nameable. A pair of
 * unreadable halves is a confident answer to the wrong question, so the card
 * gets wider instead and the row fits fewer of them. The long shapes — hulls
 * and arcs, already on a 620 px frame — stack their pair instead of splitting
 * it, which costs height nobody is short of and aligns the two along the same
 * axis, where a difference along a span is easiest to see.
 */

import type { OwnMotion } from "@neon-spore/content";
import { type CatalogueEntry, MOTIONS } from "@neon-spore/shape-sheet";
import { shapeFigure } from "./shape-figure.js";
import { SKINS, type SkinId } from "./skins/index.js";

/**
 * Which skin every card is wearing, for the whole page rather than per card:
 * the question is a comparison, and a page where three cards are lit and the
 * rest are wireframes says which cards somebody clicked. MEMBRANE rather than
 * LINE, because the outline is the control and a control is switched *to*.
 */
let skinA: SkinId = "membrane";

/**
 * The second skin, or none. `undefined` is the default and it has to be: with
 * B off the page is exactly the page that was there before this existed, and
 * pairing is something a reader turns on for one question.
 */
let skinB: SkinId | undefined;

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
 * until something is picked. Both halves of a pair take it, or the two would
 * differ by motion as well as by skin.
 */
let motion: OwnMotion | undefined;

/** What actually drives a card, so a caption can name it rather than guess. */
export function driving(entry: CatalogueEntry): OwnMotion | undefined {
  return motion ?? entry.motion;
}

/** Whether a second skin is picked — the card is wider when it is. */
export function paired(): boolean {
  return skinB !== undefined;
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
  tag(host, "A");
  for (const s of SKINS)
    button(host, s.label, s.id === skinA, s.hint, () => {
      skinA = s.id;
      rerender();
    });

  // The second skin, its own segment. OFF first and default: a page that
  // silently drew everything twice would be answering a question nobody asked,
  // and the pair costs a card a hundred pixels of width.
  tag(host, "B");
  button(host, "OFF", skinB === undefined, "one skin per card, as before", () => {
    skinB = undefined;
    rerender();
  });
  for (const s of SKINS)
    button(host, s.label, s.id === skinB, `${s.hint} — drawn beside the A skin`, () => {
      skinB = s.id;
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

function half(entry: CatalogueEntry, box: number, width: number, stroke: string, skin: SkinId) {
  const col = document.createElement("div");
  col.style.cssText = "display:flex;flex-direction:column;gap:2px;flex:0 0 auto;min-width:0";
  col.appendChild(shapeFigure(entry, { box, width, stroke, skin, lit, motion }));
  const label = document.createElement("span");
  label.textContent = SKINS.find((s) => s.id === skin)?.label ?? skin;
  label.style.cssText = "font-size:8px;letter-spacing:1px;color:#574d84;text-align:center";
  col.appendChild(label);
  return col;
}

export interface PictureOptions {
  box: number;
  /** The frame's width — `box` for a square card, wider for a long shape. */
  width: number;
  stroke: string;
  /** A long shape stacks its pair rather than splitting the width. See above. */
  wide: boolean;
}

/**
 * The card's picture: one figure, or two of them at the same size when a B
 * skin is picked. Neither is scaled down — see the measurement at the top.
 */
export function picture(entry: CatalogueEntry, o: PictureOptions): Element {
  if (skinB === undefined) {
    return shapeFigure(entry, {
      box: o.box,
      width: o.width,
      stroke: o.stroke,
      skin: skinA,
      lit,
      motion,
    });
  }
  const wrap = document.createElement("div");
  wrap.style.cssText = `display:flex;gap:6px;flex:0 0 auto;flex-direction:${o.wide ? "column" : "row"}`;
  wrap.appendChild(half(entry, o.box, o.width, o.stroke, skinA));
  wrap.appendChild(half(entry, o.box, o.width, o.stroke, skinB));
  return wrap;
}
