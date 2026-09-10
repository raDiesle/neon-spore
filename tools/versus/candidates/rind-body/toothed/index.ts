import * as rindLook from "../../../../../packages/render/src/rind-look.js";
import { patch, type Variant } from "../../../variant.js";
import { toothed } from "./paint.js";

/**
 * `rind:body` / `toothed` — a rind that is not a slick.
 *
 * **What the shipped side is.** A rind is drawn as the slick or the bulb it
 * will become, three sizes over its life and otherwise identical to the body
 * that is left at the end. Nothing in its outline says *rind*; only the size
 * does, and a big slick is a big slick.
 *
 * **What this argues.** That a rind should look like a thing with a rind on
 * it. THE RIND card on the shapes page (`drafts/tower-defence.ts`) was drawn
 * for this creature and never given to it: a round body whose rim is broken
 * into nine sharpened teeth while the armour is whole, wearing down as the
 * layers go. Here the teeth are read off the count the creature carries — two
 * layers, full teeth; one layer, half; none, the ordinary body — so the rim is
 * a second readout of what the size already says, and the shed is seen to
 * take the teeth with it. The colour and the mechanic are untouched: the fill
 * is the ammunition colour, the size is `livingBodyMul`'s, the interior is the
 * body's own, and the husk the shed throws is this contour rather than the
 * slick's.
 *
 * **How it can lose.** *A toothed rim is THE SHELL's word.* Armour on this
 * field is grey plating chipped by any colour, and a rind is answered by its
 * own colour alone — if at the pair a toothed rind reads as a body that wants
 * grey to come off it first, the teeth have to go blunter or this loses.
 */
export const RIND_BODY_TOOTHED: Variant = {
  slot: "rind:body",
  name: "toothed",
  sentence:
    "the rind wears a body of its own — nearly round, with nine sharpened teeth round the rim that wear down as the layers come off — the shapes page's own RIND card, reading its armour off the creature's count instead of a clock",
  dir: "tools/versus/candidates/rind-body/toothed",
  patches: [
    patch({
      target: rindLook.RIND_LOOK,
      // No accessor: `creature-body.ts` and `rind-shed.ts` reach the record
      // through `rindWears`, which reads the export itself.
      reached: () => rindLook.RIND_LOOK,
      where: {
        file: "packages/render/src/rind-look.ts",
        symbol: "RIND_LOOK",
        type: "RindLook",
      },
      fields: { body: toothed },
    }),
  ],
};
