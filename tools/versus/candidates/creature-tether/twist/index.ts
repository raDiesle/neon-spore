import * as tetherLook from "../../../../../packages/render/src/tether-look.js";
import { patch, type Variant } from "../../../variant.js";
import { seizing, twist } from "./paint.js";

/**
 * `creature:tether` / `twist` — the rope is two strands, and the tension
 * tightens the lay.
 *
 * **What the shipped side is.** One glowing stroke of one width from the eye
 * to the hand, thinning and brightening as it is pulled.
 *
 * **What this argues.** That a rope is *made* of something, and what it is
 * made of is what tension acts on. Two strands wound about the sag, each
 * drawn bright where it passes in front and dim where it goes behind, so
 * every crossing has an over and an under; slack, the lay is open and
 * crawls slowly along the rope, and pulled it winds tight and pulls in to
 * the axis until a taut rope is a hard finely twisted line. The root is a
 * seizing — a small loop of turns binding the strands at the eye — that
 * draws in as the pull comes on.
 *
 * **How it can lose.** *A braid at four pixels is a wobble.* If the two
 * strands cannot be told apart on a phone, this is the shipped stroke with
 * a tremor on it.
 */
export const TETHER_TWIST: Variant = {
  slot: "creature:tether",
  name: "twist",
  sentence:
    "the rope as two strands wound about the sag — bright where one passes in front, dim where it goes behind, the lay open and crawling when slack and winding tight in to the axis as it is pulled — bound at the eye by a seizing that draws in with the pull",
  dir: "tools/versus/candidates/creature-tether/twist",
  patches: [
    patch({
      target: tetherLook.TETHER_LOOK,
      // No accessor: `tether.ts` reads the export itself. The module namespace
      // is the whole route there is.
      reached: () => tetherLook.TETHER_LOOK,
      where: {
        file: "packages/render/src/tether-look.ts",
        symbol: "TETHER_LOOK",
        type: "TetherLook",
      },
      fields: { rope: twist, root: seizing },
    }),
  ],
};
