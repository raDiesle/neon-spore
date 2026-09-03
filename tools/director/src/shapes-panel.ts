/**
 * The shape catalogue: every contour that has been drawn, and every one drawn
 * for something the design has not worked out yet.
 *
 * A creature in the bestiary is a behaviour and a name with no picture. A
 * contour tuned in `legacy/style-guide.html` and never claimed is a picture
 * with no behaviour. This panel is the second half of that pair, put on the
 * same screen as the first, so a concept can be handed a shape — by a person
 * deciding it, not by the editor: nothing here writes anything.
 *
 * Three states, in reading order. DRAFTS are pictures drawn *at* a named idea,
 * offered to it and not yet accepted. FREE are pictures with nothing behind
 * them. TAKEN is what the game already draws, on the page so that a proposal
 * is judged beside the thing it will stand next to rather than on its own.
 *
 * Everything here animates, and that is the point: motion is what tells two
 * blobs apart at 26 px, and there is no simulation running behind this page to
 * take the frames from.
 *
 * The fitting and the animation are `shape-figure.ts`'s. They were this file's
 * until the backlog page needed the same picture beside the idea each draft
 * was drawn for, and a second copy of a frame-fitting algorithm is a second
 * answer to "does this card clip". What a card is *wearing* — the skin, the
 * light and the forced motion — is `shapes-pair.ts`'s, and so is the control
 * row that picks them. This file is left with the catalogue's own business:
 * which cards, in which order, with what written beside them — plus, at the
 * foot of the page, the three grids `shapes-all.ts` draws: the transpose of
 * this page's sixty-bodies-one-skin, one body in every skin, every motion and
 * both light states at once. See that file for why it is a separate page
 * rather than a fourth column on every card here.
 */

import { CATALOGUE, type CatalogueEntry } from "@neon-spore/shape-sheet";
import { inline } from "./markdown.js";
import { isWide } from "./shape-figure.js";
import { renderShapesAll } from "./shapes-all.js";
import { controlBar, picture } from "./shapes-pair.js";
import { driving } from "./shapes-state.js";

const BOX = 92;
/** The frame a long shape gets instead of the square one — see `isWide`. */
const WIDE = 620;

// The square card's width is 330px, set in the stylesheet (`.shape`). It
// briefly grew to 428px (330 + BOX + 6) when a second skin was picked beside
// the first — see `shapes-pair.ts`'s history — and is 330 again now that the
// pair is gone, so a row holds a card more than it did while the pair
// existed.

const STROKE: Record<CatalogueEntry["status"], string> = {
  draft: "var(--cyan)",
  free: "var(--gold)",
  taken: "var(--dim)",
};

const STAMP: Record<CatalogueEntry["status"], string> = {
  draft: "DRAFT",
  free: "FREE",
  taken: "TAKEN",
};

function text(parent: HTMLElement, cls: string, body: string, tag = "p"): void {
  const el = document.createElement(tag);
  el.className = cls;
  inline(el, body);
  parent.appendChild(el);
}

function card(entry: CatalogueEntry): HTMLElement {
  const div = document.createElement("div");
  div.className = `shape is-${entry.status}`;

  // Measured, not assumed. This used to ask whether the contour was open, on
  // the reasoning that an open one is the hull — but an arm is open too, and
  // it is *taller* than it is wide. It got a 686 px card with a thumbnail in
  // the middle of it and six inches of nothing either side.
  const wide = isWide(entry);
  if (wide) div.classList.add("is-wide");
  div.appendChild(
    picture(entry, { box: BOX, width: wide ? WIDE : BOX, stroke: STROKE[entry.status] }),
  );

  const side = document.createElement("div");
  const head = document.createElement("div");
  text(head, "name", entry.subject.name, "span");
  text(head, "stamp", STAMP[entry.status], "span");
  side.appendChild(head);

  // The suggestion is the first line a draft has to say, because a shape with
  // no behaviour attached to it is what the FREE column already is.
  if (entry.suggests) text(side, "suggest", `for **${entry.suggests}**`);
  text(side, "blurb", entry.owner);

  // The forced motion, if one is picked, is what actually drives the body, so
  // the caption names that one rather than the catalogue's — or the two would
  // disagree the moment a motion is forced.
  const drives = driving(entry);
  const figures = drives ? `${entry.subject.note} · moves: ${drives.note}` : entry.subject.note;
  text(side, "figures", figures);

  div.appendChild(side);
  return div;
}

function fill(id: string, entries: CatalogueEntry[]): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.replaceChildren();
  // Square cards first, the wide ones after them: a 686 px card in the middle
  // of a wrapping row leaves a hole beside every shape before it. Built first
  // and sorted after, because how wide a card is now depends on the shape it
  // was fitted to and is not knowable before it is built.
  const built = entries.map(card);
  built.sort(
    (a, b) => Number(a.classList.contains("is-wide")) - Number(b.classList.contains("is-wide")),
  );
  for (const el2 of built) el.appendChild(el2);
}

export function renderShapes(): void {
  if (!document.getElementById("shapesFree")) return;

  const host = document.getElementById("shapesSkin");
  if (host) controlBar(host, renderShapes);

  fill(
    "shapesDrafts",
    CATALOGUE.filter((e) => e.status === "draft"),
  );
  fill(
    "shapesFree",
    CATALOGUE.filter((e) => e.status === "free"),
  );
  fill(
    "shapesTaken",
    CATALOGUE.filter((e) => e.status === "taken"),
  );

  renderShapesAll();
}
