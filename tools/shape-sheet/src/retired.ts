import type { CreatureSilhouette } from "@neon-spore/content";
import { TREMBLE } from "@neon-spore/content";
import type { CatalogueEntry } from "./catalogue.js";
import { blob } from "./subjects.js";

/**
 * Shapes the game carried and gave back.
 *
 * A third provenance beside the two `catalogue.ts` already had. A *free*
 * contour was drawn in `legacy/style-guide.html` and never claimed; a *draft*
 * was drawn at an idea that has not been designed around yet. These were
 * neither: something in the bestiary wore them, and then that something was
 * retired. They are `free` all the same, because free is a statement about
 * whether anything draws them today and not about where they came from.
 *
 * Its own file rather than more of `catalogue.ts`, which sits at the 250-line
 * limit — and the seam is a real one, because a retired shape carries
 * something a spare one does not: the argument that killed it, which whatever
 * takes it next inherits.
 */

/**
 * Four shallow lobes at just over half the size of anything else that glides.
 *
 * The runt's, until THE LURE retired the runt: a lure is a full-size slick or
 * bulb on both screens, so there is no small body left in the bestiary for
 * this to be. Kept rather than deleted because nothing is wrong with it, and
 * because a contour in `packages/content` that no kind maps to is exactly the
 * drift `silhouettes.ts` warns about.
 *
 * Whatever takes it next inherits the question that killed every proposal for
 * the runt's interior: at `sizeMul` 0.55 it draws at about 10 px, and
 * `docs/spec/graphics.md` says nothing of a figure survives below 11. That
 * question is not open any more — it dissolved with the creature — but it
 * would open again the moment something small claimed this.
 */
const RUNT: CreatureSilhouette = {
  lobes: 4,
  depth: 0.22,
  wobble: 0.03,
  rx: 30,
  ry: 30,
  seed: 6.0,
  sizeMul: 0.55,
};

export const RETIRED: CatalogueEntry[] = [
  {
    subject: blob("RUNT", RUNT),
    status: "free",
    slot: "creature",
    owner:
      "nothing since THE LURE retired the runt — the only contour here shrunk well below the rest, and the only one the game has carried and given back",
    // Its own-motion comes with it: `TREMBLE` was written for a body too small
    // to glide, and is spare for the same reason the shape is.
    motion: TREMBLE,
  },
];
