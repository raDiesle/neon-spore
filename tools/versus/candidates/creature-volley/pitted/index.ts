import * as volleyLook from "../../../../../packages/render/src/volley-look.js";
import { shippedSeams } from "../../../../../packages/render/src/volley-stone.js";
import { patch, type Variant } from "../../../variant.js";
import { pittedStone } from "./paint.js";

/**
 * `creature:volley` / `pitted` — the stone wears the pits it was born with,
 * and they come round as the ball rolls.
 *
 * **What the shipped side is.** A bare lit polygon: the meteor's stone with no
 * crater on it, because a volley has never been shot. It turns in its own
 * plane, and a bare disc turning in its own plane is a coin — nothing on it
 * says which way is round.
 *
 * **What this argues.** That a stone that has been in space is pitted, and
 * that the pits should be *placed* on the ball rather than painted on the
 * picture: seven of the meteor's own craters at a longitude and a latitude
 * each, turned by the roll, so they sweep across the face, thin at the limb,
 * go behind and come back round. That reveal is the one cue a disc cannot
 * fake (`docs/dimensional.md`), and it is the argument `.claude/skills/depth`
 * makes for every big body. The cracks a ward leaves and the seams over them
 * are the shipped ones, so the pattern the owner drew is untouched.
 *
 * **How it can lose.** *The pits fight the count.* A crater on this body is
 * what a ward leaves, and a pair that reads "how many holes" off a rock has
 * been taught that by THE METEOR. If seven small pits read as seven hits
 * before the shield has touched it, the weathering is a lie about the count
 * and goes.
 */
export const VOLLEY_PITTED: Variant = {
  slot: "creature:volley",
  name: "pitted",
  sentence:
    "the stone born with seven of a meteor's own pits, placed by longitude and latitude and turned by the roll — sweeping across the face, thinning at the limb and coming back round, so the ball is a ball and not a coin; the shipped seams over it",
  dir: "tools/versus/candidates/creature-volley/pitted",
  patches: [
    patch({
      target: volleyLook.VOLLEY_LOOK,
      reached: () => volleyLook.VOLLEY_LOOK,
      where: {
        file: "packages/render/src/volley-look.ts",
        symbol: "VOLLEY_LOOK",
        type: "VolleyLook",
      },
      // The seams are the shipped ones: this slot patches both fields because
      // every candidate in it must, and this answer is about the stone alone.
      fields: { stone: pittedStone, seams: shippedSeams },
    }),
  ],
};
