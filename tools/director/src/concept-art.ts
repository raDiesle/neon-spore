import { CATALOGUE, type CatalogueEntry } from "@neon-spore/shape-sheet";
import { isWide, shapeFigure } from "./shape-figure.js";
import { hasSilhouette, silhouette } from "./silhouette.js";

/**
 * The picture beside a planned concept.
 *
 * Every entry on the backlog page is a name and a paragraph, and a paragraph
 * is the slowest way to find out what something looks like. Most of them do
 * have a picture: `tools/shape-sheet/src/drafts/` holds a contour drawn *at* a
 * named idea, and each one carries the name of the idea it was offered to. It
 * has only ever been visible on the SHAPES tab, though — beside the other
 * shapes rather than beside the idea, which is the one place it answers a
 * question. This is the join.
 *
 * **Nothing here invents a picture**, the same rule `sound-art.ts` runs on. A
 * concept gets the contour that was drawn for it, or the contour it already
 * carries if the name is one the game draws, or an empty frame that says which
 * of those two is missing. An icon chosen here to fill a gap would be a fourth
 * opinion about what the Colony looks like, and the design has three already.
 *
 * A draft **animates**, and the still beside a built name does not. That is
 * deliberate and it is the difference being shown: a draft is a proposal, and
 * whether its lobes swing or only shiver is most of what a person is being
 * asked to accept — while a name the game already draws has a simulation
 * behind it, and a card is not where its motion is judged.
 */

/** The shape drawn at this concept, or undefined. Matched on the spec's name. */
export function draftFor(name: string): CatalogueEntry | undefined {
  if (!name) return undefined;
  return CATALOGUE.find((e) => e.suggests === name);
}

const BOX = 46;
const WIDE = 132;

/**
 * Why there is no picture, said in the words that name what would fix it.
 *
 * A row with a blank where a shape goes and a row whose shape failed to draw
 * look the same, and they are not the same thing at all — so the blank is a
 * frame with a mark in it and a title that says which case this is.
 */
function gap(name: string): HTMLElement {
  const box = document.createElement("span");
  box.className = "concept-art is-none";
  const mark = document.createElement("span");
  mark.textContent = "?";
  mark.title = name
    ? `no contour has been drawn at ${name} yet — SHAPES has the spare ones, and handing one over is a decision, not an edit here`
    : "this entry has no name of its own, so there is nothing to have drawn a shape at";
  box.appendChild(mark);
  return box;
}

/**
 * The concept's picture: a draft offered to it, a contour it already carries,
 * or the gap. Always the same width, so a column of entries stays a column.
 */
export function conceptArt(name: string): HTMLElement {
  const draft = draftFor(name);
  if (draft) {
    const box = document.createElement("span");
    const wide = isWide(draft);
    box.className = wide ? "concept-art is-draft is-wide" : "concept-art is-draft";
    box.title = `${draft.subject.name} — a shape drawn at ${name}, offered and not accepted. ${draft.owner}`;
    box.appendChild(
      shapeFigure(draft, {
        box: BOX,
        width: wide ? WIDE : BOX,
        stroke: "var(--cyan)",
        weight: 1.6,
      }),
    );
    return box;
  }

  // A name the game already draws. Rare here — the backlog is the unbuilt —
  // but a boss slot can carry a creature's name, and a picture it already has
  // beats one it does not.
  if (hasSilhouette(name)) {
    const box = document.createElement("span");
    box.className = "concept-art is-taken";
    box.title = `${name} — the contour the game draws`;
    box.appendChild(silhouette(name, "var(--dim)", BOX));
    return box;
  }

  return gap(name);
}

/**
 * Whether there is a picture at all, so a page can leave the frame out rather
 * than draw the gap. The gap is right on a list of named concepts — a name
 * nobody has drawn anything at is a fact worth showing — and wrong on a group
 * whose headings are sentences rather than names, where every single frame
 * would be empty.
 */
export function hasConceptArt(name: string): boolean {
  return draftFor(name) !== undefined || hasSilhouette(name);
}
