import * as craterLook from "../../../../../packages/render/src/crater-look.js";
import { patch, type Variant } from "../../../variant.js";
import { shards } from "./paint.js";

/**
 * `ship:crater` / `shards` — the crumb in the lip is the rock, not the ship.
 *
 * **What the shipped side is.** `spall` (`crater-spall.ts`): eleven plates of
 * membrane pulled into the hole, one size of piece, and no crumb along the
 * break at all.
 *
 * **What this argues.** The same second cut `grit` makes — the identical band,
 * count, scatter and turn, to the number — painted in `PALETTE.rock` and
 * `PALETTE.rockDark` instead of the ship's colours. A rock that goes through a
 * membrane does not come out of it whole either, and what stayed behind is the
 * only thing on an old hole that still says *what made it*.
 *
 * **The two are one question deliberately split in half.** A candidate that
 * moved the geometry *and* changed the material would be a vote on two things,
 * and whichever way it went nobody would know which half had been chosen. So
 * `grit` and this are the same shape and differ in two colours: the question is
 * **whose material is crumbling**.
 *
 * **What it may not touch, and does not.** `spallRing`, `hole` and `seam` are
 * called rather than copied, and every piece goes through `facet`
 * (`break-piece.ts`), so the shipped plates and the one rule about what a
 * fragment looks like are both untouched.
 *
 * **How it can lose, and it is the sharper risk of the two.** Grey is the
 * field's word for a rock, and a rock is a thing the pair has to answer out
 * loud. Grey lying on the hull is grey where nothing can arrive — read
 * `paint.ts`, and watch a falling rock cross a hull that already carries three
 * of these.
 */
export const CRATER_SHARDS: Variant = {
  slot: "ship:crater",
  name: "shards",
  sentence:
    "the same crumb along the lip, in the rock's own greys — what is still coming away is the thing that hit, not the ship",
  dir: "tools/versus/candidates/ship-crater/shards",
  patches: [
    patch({
      target: craterLook.CRATER_LOOK,
      reached: () => craterLook.CRATER_LOOK,
      where: {
        file: "packages/render/src/crater-look.ts",
        symbol: "CRATER_LOOK",
      },
      fields: { pit: shards },
    }),
  ],
};
