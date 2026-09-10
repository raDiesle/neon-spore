import * as veerLook from "../../../../../packages/render/src/veer-look.js";
import { patch, type Variant } from "../../../variant.js";
import { hunchedRider } from "./paint.js";

/**
 * `creature:veer` / `hunched` — something clinging to the stone rather than
 * sitting on it.
 *
 * **What the shipped side is.** A head on a collar of beads, and the collar
 * is the only thing saying the figure is on the rock at all. Read at a tile,
 * it is a circle over a heptagon, and a circle over a heptagon is two shapes.
 *
 * **What this argues.** That the rider should have a *body*, and that the
 * body should be the thing holding on: a squat mound straddling the crown,
 * as wide as the stone's shoulders and merged into it so the two are one
 * silhouette, two arms down the flanks ending in mitts pressed to the rock,
 * the head sunk in to its chin and the hat a stub. On the brace the mound
 * flattens and the arms dig in — the same tell the crouch is, said by a body
 * that has one. The face is the shipped one. It is the owner's rule that the
 * parts of one creature must overlap into one mass, applied to a rider that
 * was two.
 *
 * **How it can lose.** *The clown goes.* A cone hat, a nose and a grin on a
 * head that is mostly buried may read as a boulder with a lump on it rather
 * than as somebody up there. If the pair stops seeing a passenger, the mound
 * has eaten the figure it was meant to give a body to.
 */
export const VEER_HUNCHED: Variant = {
  slot: "creature:veer",
  name: "hunched",
  sentence:
    "a squat body hugging the crown of the stone and merged into it, two arms down the flanks ending in mitts, the head sunk to its chin and the hat a stub — a thing clinging to a rock, which flattens and digs in on the beat before the step",
  dir: "tools/versus/candidates/creature-veer/hunched",
  patches: [
    patch({
      target: veerLook.VEER_LOOK,
      reached: () => veerLook.VEER_LOOK,
      where: {
        file: "packages/render/src/veer-look.ts",
        symbol: "VEER_LOOK",
        type: "VeerLook",
      },
      fields: { rider: hunchedRider },
    }),
  ],
};
