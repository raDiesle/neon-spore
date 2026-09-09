import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { lattice } from "./paint.js";

/**
 * `creature:slick` / `lattice` — a frame under the membrane.
 *
 * **What this argues.** That the slick is not wet all the way through. Six
 * struts meeting at a hub in each sac, turning, with the skin stretched over
 * them: a seed pod rather than an animal. It is the one of the five that
 * changes what the creature *is*, and it is offered for that reason — five
 * answers that all agree about the material would be one answer offered five
 * times.
 *
 * **How it can lose, and it is the sharpest risk on this page.** *Straight
 * lines are not this game.* Every body on the field is a closed contour with
 * lobes, and a set of chords is the one interior that could read as belonging
 * to a different game entirely. If a slick stops looking like a living thing,
 * nothing else about this matters.
 */
export const SLICK_LATTICE: Variant = {
  slot: "creature:slick",
  name: "lattice",
  sentence: "six struts and a hub in each sac, turning under the skin — a pod, not an animal",
  dir: "tools/versus/candidates/creature-slick/lattice",
  patches: [
    patch({
      target: interior.SLICK_LOOK,
      reached: () => interior.interiorFor("slick"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "SLICK_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: lattice },
    }),
  ],
};
