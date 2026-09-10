import * as lidLook from "../../../../../packages/render/src/lid-look.js";
import { patch, type Variant } from "../../../variant.js";
import { roll } from "./paint.js";

/**
 * `creature:lid` / `roll` — the armour rolls up instead of sliding away.
 *
 * **What the shipped side is.** Two flat plates that slide apart. A slide is
 * the one motion that says nothing about what a thing is made of: the plate
 * that has moved is the same rectangle it was, and the armour that has come
 * off the lens has simply gone.
 *
 * **What this argues.** That retracted armour has to go somewhere, and where
 * it goes can be seen. Each plate is a sheet whose inner edge is wound into a
 * vertical cylinder, and the cylinder fattens with the gap — shut, two thin
 * beads meet as a raised seam down the middle of the eye; fully open, two fat
 * rolls stand at the corners with the sheet flat and grey behind them. A
 * cylinder is round, so it takes the one key light the way every round thing
 * on the field does: bright toward `KEY`, dark away, a highlight a third of
 * the way in. The roll's radius is read off the gap and nothing else, so the
 * readout is the rule's number twice over — where the roll stands and how
 * thick it has got. The seam in the lens's colour stays on the roll's inner
 * face.
 *
 * **How it can lose.** *The roll is the readout's edge, and it is fat.* The
 * seat without the cord reads the gap as the other seat's hand, and the gap
 * is now between two rolls whose inner faces are curved rather than two flat
 * edges. If at the pair the roll makes the opening look smaller than the rule
 * says, `ROLL_GROW` comes down until the seam is unmistakably the edge — or
 * the whole idea loses to the slide.
 */
export const LID_ROLL: Variant = {
  slot: "creature:lid",
  name: "roll",
  sentence:
    "the plates roll up rather than slide — each inner edge winds into a cylinder that fattens as the eye opens and takes the key light like every round thing on the field, so the armour that has come off the lens is seen as a thickness rather than an absence",
  dir: "tools/versus/candidates/creature-lid/roll",
  patches: [
    patch({
      target: lidLook.LID_LOOK,
      // No accessor: `lid.ts` reads the export itself, once per lid.
      reached: () => lidLook.LID_LOOK,
      where: {
        file: "packages/render/src/lid-look.ts",
        symbol: "LID_LOOK",
        type: "LidLook",
      },
      fields: { plates: roll },
    }),
  ],
};
