import * as coilLook from "../../../../../packages/render/src/coil-look.js";
import { studs } from "../../../../../packages/render/src/coil-look.js";
import { patch, type Variant } from "../../../variant.js";
import { leap } from "./paint.js";

/**
 * `creature:coil` / `leap` — the charge jumps.
 *
 * **What the shipped side is.** Two crackling bolts growing out from the
 * failed dome's tile toward the next one, with a halo at the tip: a line
 * being drawn across the field over three beats.
 *
 * **What this argues.** That what passes between domes should read as a
 * body in flight rather than a rope being paid out. A ball of light on a
 * bowed path, rising off the chord and coming down onto the dome it is
 * aimed at, with a tail of fading copies behind it — and no line at all
 * between the two until the last stretch, when a short bolt reaches out of
 * the ball and strikes the rim. The studs are the shipped ones; this answer
 * is about the crossing, not the landing.
 *
 * **How it can lose.** *A ball in the air is a shot.* If at speed the charge
 * reads as one of the pair's own bullets going sideways, the chain is a
 * coincidence again.
 */
export const COIL_LEAP: Variant = {
  slot: "creature:coil",
  name: "leap",
  sentence:
    "the charge as a ball of light thrown from dome to dome on a bowed path — rising off the chord and coming down onto its target, a tail of five fading copies behind it, and only in the last stretch a short bolt reaching out to strike the rim; the shipped studs",
  dir: "tools/versus/candidates/creature-coil/leap",
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
      // The studs are the shipped ones: this slot patches both fields because
      // every candidate in it must, and this answer has nothing to say about
      // the rim.
      fields: { studs, charge: leap },
    }),
  ],
};
