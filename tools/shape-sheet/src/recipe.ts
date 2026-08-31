import type { OwnMotion } from "@neon-spore/content";
import type { CatalogueEntry } from "./catalogue.js";
import { type Attachment, type GrownOpts, grown } from "./parts/index.js";

/**
 * A body written as a base and a list of parts, and the one function that
 * turns a list of those into catalogue entries.
 *
 * Extracted when the jellies arrived and `grown-bodies.ts` would otherwise
 * have been two hundred lines of recipe plus a mapper both files needed. The
 * seam is the obvious one: this is *what a recipe is*, and each of the two
 * files beside it is *which recipes there are*.
 */
export interface Recipe extends Omit<GrownOpts, "parts"> {
  name: string;
  /** The recipe, in the words a person would use to ask for it. */
  note: string;
  /** Why nothing carries it — what a creature taking it would inherit. */
  owner: string;
  /**
   * How the whole body moves, where a pose can say something the contour
   * cannot. Absent for anything whose motion is entirely in its outline.
   */
  motion?: OwnMotion;
  parts: Attachment[];
}

export function bodiesFrom(recipes: Recipe[]): CatalogueEntry[] {
  return recipes.map((r) => ({
    subject: grown(r.name, r.note, r),
    status: "free",
    slot: "creature",
    owner: r.owner,
    motion: r.motion,
  }));
}
