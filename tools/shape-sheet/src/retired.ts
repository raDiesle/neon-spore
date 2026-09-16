import type { CreatureSilhouette } from "@neon-spore/content";
import { TREMBLE } from "@neon-spore/content";
import type { CatalogueEntry } from "./catalogue.js";
import { studded, welling } from "./forms/index.js";
import { HEAVE, SWELL } from "./motions.js";
import { blob } from "./subjects.js";

/**
 * Shapes that were in the catalogue under their own heading and are not any
 * more.
 *
 * A third provenance beside the two `catalogue.ts` already had. A *free*
 * contour was drawn in `legacy/style-guide.html` and never claimed; a *draft*
 * was drawn at an idea that has not been designed around yet. These were
 * neither. They are `free` all the same, because free is a statement about
 * whether anything draws them today and not about where they came from.
 *
 * **Three ways in, and only the first is the one this file was opened for.**
 * The first is a shape the game carried and gave back: something in the
 * bestiary wore it, and then that something was retired. The second is a
 * shape that lost — two entries standing for one proposal, judged side by
 * side, and the catalogue keeping one. A conversion that was drawn twice is
 * not two bodies, and leaving both on the SHAPES tab spends a decision that
 * has already been made. The third is a **draft whose idea got built and did
 * not take the drawing with it**: the idea leaves `ideas.md` the day it ships,
 * and a `suggests` pointing at a heading that is gone is the one thing
 * `drafts.test.ts` refuses. The shape itself is not spent by that — the
 * argument it was drawn for still holds somewhere else — so it comes here
 * rather than being deleted, with what happened written down.
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
    subject: welling(
      "THE BREACH",
      "a torn opening, and something rising in it",
      44,
      52,
      0.34,
      0.16,
      5.5,
    ),
    motion: HEAVE,
    status: "free",
    slot: "creature",
    owner:
      "nothing, and it is here because the idea it was drawn at got built without it. It was offered to *Reverse wave* — a wave from below, out of the ship's own damage — and on 16 September 2026 the owner replaced that design with THE REPRISE, a wave sent again unseen from the top (`docs/spec/bosses.md` 11.15). The picture that shipped took the argument and not the contour: a hole in the sky rather than in the hull, and an **open** stroke along the field's own top edge rather than a closed shape, because drawn closed it read as a slug with two eyes — which is the failure `forms/anchored.ts` warns about at the top of the file it defines this in. Whatever takes it next inherits exactly that: the torn rim is worth having and the enclosure is what costs you, so it wants to be something genuinely *in* an opening, with the opening's edge over it",
  },
  {
    // The crown points up the sheet's axis, which is where the source gathers
    // its bright swellings.
    subject: studded("THE BURR", "a heavy body wearing blunt knobs, and a crown of longer ones", {
      rx: 88,
      ry: 82,
      studs: 13,
      reach: 0.3,
      width: 0.26,
      blunt: 0.85,
      lobes: 4,
      depth: 0.06,
      seed: 2.4,
      crown: { reach: 0.56, at: -Math.PI / 2, spread: 0.75 },
    }),
    motion: SWELL,
    status: "free",
    slot: "boss",
    owner:
      "nothing, and nothing will: it is the Galaxy Defense stage boss converted with `studded`, and THE POMMEL is the same boss converted a second time with `clubbed` after the two were drawn side by side. What it lost on is the waist. A ball on a stalk has two radii at the same angle — the near side of the cap and the far side — and `studded` is a radius function, so the near one has nowhere to go: the necks close, the knobs run together into a continuous spiky rim, and the body reads as a sea urchin rather than as a mace. That is not a tuning it never got; `blunt` rounds a tip and the defect is under the tip. Kept rather than deleted because the *crown* is an idea nothing else here makes — a few of the features simply longer and all on one side, which is how a silhouette says *front* at 26 px where the source says it with light. Whatever takes that idea next should take it to `clubbed`",
  },
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
