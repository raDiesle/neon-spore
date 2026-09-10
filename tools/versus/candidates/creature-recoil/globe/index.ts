import * as recoilLook from "../../../../../packages/render/src/recoil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { globe } from "./paint.js";

/**
 * `creature:recoil` / `globe` — the cage is a wire ball round the body, and
 * it turns.
 *
 * **What the shipped side is.** Three springs from the body out to a hoop,
 * in one plane, lit. A frame drawn on the picture rather than round the
 * thing: the hoop is a circle with no near side, and nothing about it could
 * go behind the body because there is no behind.
 *
 * **What this argues.** That a cage round a body is a ball of wire, and a
 * ball has a back. Each rib is a whole meridian — the great circle through
 * both poles at its own longitude — pinned and projected by `facet`, so it is
 * an ellipse with a near half drawn thick and lit over the body and a far
 * half thin and dim behind it. The hoop is the equator, tilted so its front
 * dips below the middle. The ball turns slowly about the vertical, and the
 * turn is the whole argument: a rib at the limb is a line, swings out into a
 * curve as it comes round the front, and closes to a line again on the far
 * side — the reveal no pose can produce, on the one body on the field that
 * wears a frame. A spent rib is a broken meridian, two scorched stubs off
 * the poles and nothing between, and it goes round with the rest so the
 * hole in the cage turns past. Whole rings are bounces left; broken ones are
 * bounces spent; the count is untouched.
 *
 * **How it can lose.** *The count is harder to read.* Three rings on a
 * turning ball are six arcs, and a pair counting ribs from the top going
 * round now has to count rings as they pass through a line. If at the pair
 * it takes longer to say "two left" than it did, the mechanic has paid for
 * the picture and the candidate has lost.
 */
export const RECOIL_GLOBE: Variant = {
  slot: "creature:recoil",
  name: "globe",
  sentence:
    "the cage as a wire ball — each rib a whole meridian through the poles with its near half lit over the body and its far half dim behind, the hoop a tilted equator, the ball turning slowly so every rib swings from a line at the limb to a curve at the front and back",
  dir: "tools/versus/candidates/creature-recoil/globe",
  patches: [
    patch({
      target: recoilLook.RECOIL_LOOK,
      // No accessor: `recoil.ts` reads the export itself, once per frame. The
      // module namespace is the whole route there is.
      reached: () => recoilLook.RECOIL_LOOK,
      where: {
        file: "packages/render/src/recoil-look.ts",
        symbol: "RECOIL_LOOK",
        type: "RecoilLook",
      },
      fields: { cage: globe },
    }),
  ],
};
