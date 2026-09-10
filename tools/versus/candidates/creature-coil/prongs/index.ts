import * as coilLook from "../../../../../packages/render/src/coil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { prongs, spray } from "./paint.js";

/**
 * `creature:coil` / `prongs` — the dome has terminals, and the charge sprays.
 *
 * **What the shipped side is.** Three discs on the rim that brighten as a
 * charge approaches, and two bolts with a glow on the tip.
 *
 * **What this argues.** That the two halves of the chain should say the same
 * thing from both ends. The studs become prongs — short two-faced spikes off
 * the rim with a bead on each tip — and while a charge is on its way the tips
 * flare and a crackle runs round the rim from prong to prong, so the dome
 * itself says *about to fail* before the bolt has arrived. The bolt keeps its
 * shape and gains a spray of three short sparks off the head, a discharge
 * searching for something to land on. Both fields move, because the argument
 * is that they are one picture.
 *
 * **How it can lose.** *Three spikes on a bubble are a mine.* If at 26 px an
 * uncharged dome with prongs on it reads as a thing that hurts to touch, it
 * has stopped saying *a rock inside a shell*.
 */
export const COIL_PRONGS: Variant = {
  slot: "creature:coil",
  name: "prongs",
  sentence:
    "the studs as three two-faced prongs off the rim with a bead on each tip, lit on their key side — flaring and crackling from prong to prong round the rim while a charge is on its way — and the bolt with a spray of three short sparks fanning off its head",
  dir: "tools/versus/candidates/creature-coil/prongs",
  patches: [
    patch({
      target: coilLook.COIL_LOOK,
      // No accessor: `coil.ts` and `coil-jump.ts` read the export itself. The
      // module namespace is the whole route there is.
      reached: () => coilLook.COIL_LOOK,
      where: {
        file: "packages/render/src/coil-look.ts",
        symbol: "COIL_LOOK",
        type: "CoilLook",
      },
      fields: { studs: prongs, charge: spray },
    }),
  ],
};
