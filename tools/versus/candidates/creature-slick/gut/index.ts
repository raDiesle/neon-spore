import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { gut } from "./paint.js";

/**
 * `creature:slick` / `gut` — one animal, not two bags.
 *
 * **What this argues.** The slick's silhouette is two sacs joined at a deep
 * waist, and nothing inside it has ever said whether that waist is a join or a
 * pinch in one body. A single tube coiling through both, passing across the
 * waist, answers that: it is one creature and the waist is where its middle
 * is. Where ROE says *contents*, this says *anatomy*, and the two should be
 * tellable apart at a glance or neither is worth taking.
 *
 * **How it can lose.** *The waist segment reads as a bar.* The one flat mark in
 * the look is the crossing, and a horizontal line through the narrowest part of
 * a body is also what a damaged thing looks like. If the pair reads a slick as
 * *broken* rather than as *one*, this is finished — and that is a thing to
 * watch for on the field rather than on a card.
 */
export const SLICK_GUT: Variant = {
  slot: "creature:slick",
  name: "gut",
  sentence:
    "one tube coiled through both sacs and across the waist — the join is a middle, not a seam",
  dir: "tools/versus/candidates/creature-slick/gut",
  patches: [
    patch({
      target: interior.SLICK_LOOK,
      reached: () => interior.interiorFor("slick"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "SLICK_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: gut },
    }),
  ],
};
