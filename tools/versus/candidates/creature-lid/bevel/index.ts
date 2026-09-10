import * as lidLook from "../../../../../packages/render/src/lid-look.js";
import { patch, type Variant } from "../../../variant.js";
import { bevel } from "./paint.js";

/**
 * `creature:lid` / `bevel` — the sliding plates, with a thickness.
 *
 * **What the shipped side is.** Two flat rectangles of shell grey with two
 * lines on each, sliding apart by the pull, their inner edges lit in the
 * lens's colour. The gap is the readout and it is right; the plates around it
 * are the same grey at the limb as at the middle and their edges are lines
 * with nothing behind them.
 *
 * **What this argues.** That armour on a ball is curved and has a thickness,
 * and both can be shown without touching the gap. Each plate is shaded
 * across its width — bright over the top of the eye, darker as it wraps to
 * the limb — and takes the key light on top of that, so the left plate is the
 * lit one. Each inner edge is a wall the armour's thickness deep, and the two
 * walls are lit oppositely because they face opposite ways under one light:
 * bright on the right plate, dark on the left. The grooves are engraved — a
 * dark cut with a lit lip — rather than drawn on. The seam in the lens's
 * colour stays, because a shut lid must still say which trigger to load.
 *
 * **How it can lose.** *A wall is a second edge.* The seat without the cord
 * reads the gap as the other seat's hand, and the gap is now bounded by two
 * strips rather than two lines — if at the pair the wall makes the gap look
 * narrower or wider than the rule says, it goes thinner until the readout is
 * exactly where it was, or this loses to the flat plates.
 */
export const LID_BEVEL: Variant = {
  slot: "creature:lid",
  name: "bevel",
  sentence:
    "the same two plates sliding on the same gap, but curved across their width and cut with a wall at each inner edge — one lit, one dark, under the one key light — so the armour reads as a thickness lying on a ball rather than two grey rectangles",
  dir: "tools/versus/candidates/creature-lid/bevel",
  patches: [
    patch({
      target: lidLook.LID_LOOK,
      // No accessor: `lid.ts` reads the export itself, once per lid. The module
      // namespace is the whole route there is.
      reached: () => lidLook.LID_LOOK,
      where: {
        file: "packages/render/src/lid-look.ts",
        symbol: "LID_LOOK",
        type: "LidLook",
      },
      fields: { plates: bevel },
    }),
  ],
};
