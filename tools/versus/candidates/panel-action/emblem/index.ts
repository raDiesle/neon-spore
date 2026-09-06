import * as controls from "../../../../../packages/render/src/controls.js";
import { patch, type Variant } from "../../../variant.js";
import { emblem } from "./paint.js";

/**
 * `panel:action-face` / `emblem` — player 1's two buttons show the thing
 * instead of naming it.
 *
 * The slot asks what belongs on the face of the two controls only player 1
 * has. What ships is the control's own word, SHIELD and SUCK, set in the
 * panel's type — and text is the one thing on this panel that has to be *read*
 * rather than seen. Every other button already shows what it is for: the
 * ammunition buttons wear the creature that colour answers, drawn exactly as
 * the field draws it.
 *
 * EMBLEM answers with the ship doing it. Both buttons carry the same membrane
 * the hull is made of, once swelling into the lit ward and once opening into a
 * throat with motes falling down it. One skin, two directions, which is what
 * the simulation already does with the pair — the maw is the cannon lobe with
 * the sign of its lift taken away — so the two buttons are legible *against
 * each other* rather than one at a time.
 *
 * It should win in THE MIRROR if it wins anywhere. A sequence glyph is a fifth
 * the size of a band button, far too small for a word, so the shipped face
 * draws nothing at all there and the two steps are told apart by colour alone —
 * cyan or amber, which is one channel and the wrong one to bet a boss about
 * memory on. An emblem is a shape, and it is drawn at every size.
 *
 * How it can lose. A word is unambiguous and a picture is an argument: a lobe
 * standing on a line at 26 px may read as nothing in particular, and a pair
 * who never learn which bump is which have lost something the word gave them
 * for free. The motes are the weakest part — three dots in a column above a
 * dent, at the size a thumb actually meets it, may simply be three dots. And
 * the shipped word has one property nothing here can match: it is the same
 * string the control carries everywhere else in the repository, so a player
 * asking somebody else what SUCK does can be answered.
 */
export const PANEL_EMBLEM: Variant = {
  slot: "panel:action-face",
  name: "emblem",
  sentence:
    "the ship's own skin doing it — the ward swelling on one button, the throat opening on the other with motes falling in",
  dir: "tools/versus/candidates/panel-action/emblem",
  patches: [
    patch({
      target: controls.ACTION_LOOK,
      // No accessor: `drawActionButton` reads the export itself on every call,
      // which is why it is a record at all. The module namespace is the whole
      // route there is.
      reached: () => controls.ACTION_LOOK,
      where: {
        file: "packages/render/src/controls.ts",
        symbol: "ACTION_LOOK",
        type: "ActionLook",
      },
      fields: { face: emblem },
    }),
  ],
};
