import * as recoilLook from "../../../../../packages/render/src/recoil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { tube } from "./paint.js";

/**
 * `creature:recoil` / `tube` — the same cage, made of round wire.
 *
 * **What the shipped side is.** Three zigzag leaves from the body to a hoop,
 * a quarter of hoop and a bolt each, every one a stroke through
 * `strokeGlow`: the ward's own lit-edge treatment, on a frame that returns a
 * shot the way the ward does. It says *spring* and it says *how many are
 * left*, and every line of it is a line — the same width, the same colour,
 * from the near side and the far side, because a stroke has neither.
 *
 * **What this argues.** That the picture is right and the material is not.
 * The ribs walk the shipped folds (`ribPath`) and the hoop keeps its arcs,
 * its gaps and its bolts, so the count reads exactly as before; but every
 * stroke is laid three times — dark at full width, the metal narrower and
 * shifted toward the key, a thread of light narrower still and shifted
 * further — which is what turns a line into a cylinder with a lit crest and
 * a shadowed side. The hoop is walked in pieces, each lit by its own normal
 * against the key through `surfaceLit`, so it runs bright at the upper-left
 * and dark at the lower-right, and each bolt is a ball with a highlight
 * rather than a disc with a rim. The neon stays, on the crest.
 *
 * **How it can lose.** *Three passes on a 26 px cage are one smear.* At the
 * size a phone draws a lane, a rib is four pixels wide and the three shifts
 * are a pixel apart; if the wire reads as a thicker, muddier version of the
 * shipped line rather than as a wire, the widths have to go down or the
 * candidate has to go.
 */
export const RECOIL_TUBE: Variant = {
  slot: "creature:recoil",
  name: "tube",
  sentence:
    "the same springs and hoop, in round wire — every stroke laid dark, then lit and shifted toward the key, then a thread of light on the crest, the hoop lit round its ring by its own normal and the bolts as balls",
  dir: "tools/versus/candidates/creature-recoil/tube",
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
      fields: { cage: tube },
    }),
  ],
};
