import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { roe } from "./paint.js";

/**
 * `creature:slick` / `roe` — the sacs are carrying something.
 *
 * **What the shipped side is.** Two dots, one per sac, in the rim colour, at a
 * fixed place, and that is the whole interior of the body the pair sees on more
 * waves than any other (`body-interior.ts`). It is not wrong; it is silent.
 *
 * **What this argues.** A slick is two sacs holding on to each other, and a sac
 * is a container. Seven eggs in each, pinned to a surface that turns slowly on
 * the contour clock, so the ones at the back come round into view — the one cue
 * a pose can never produce, and the reason this is worth animating rather than
 * drawing as a still.
 *
 * **How it can lose.** *It reads as texture.* At twenty-six pixels seven eggs
 * per sac may be a stipple rather than a count, and a body that was two clean
 * dots would have become a smudge. The honest test is the pose that puts four
 * kinds on one frame: if a slick stops being tellable from a bulb across the
 * field, this has failed however good it looks large.
 */
export const SLICK_ROE: Variant = {
  slot: "creature:slick",
  name: "roe",
  sentence: "seven eggs in each sac, turning — the ones at the back come round into view",
  dir: "tools/versus/candidates/creature-slick/roe",
  patches: [
    patch({
      target: interior.SLICK_LOOK,
      // The route the drawing code takes: `drawDetails` asks `interiorFor` for
      // the kind it was handed, and the slick's is this object.
      reached: () => interior.interiorFor("slick"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "SLICK_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: roe },
    }),
  ],
};
