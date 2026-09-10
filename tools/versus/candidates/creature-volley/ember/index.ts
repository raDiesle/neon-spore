import * as volleyLook from "../../../../../packages/render/src/volley-look.js";
import { shippedStone } from "../../../../../packages/render/src/volley-stone.js";
import { patch, type Variant } from "../../../variant.js";
import { emberSeams } from "./paint.js";

/**
 * `creature:volley` / `ember` — the seams are the body inside burning
 * through the joints.
 *
 * **What the shipped side is.** The colour painted on the stone in four lines
 * with a soft glow round them. It says what is sealed inside, and it says it
 * the same way whether the ball is whole or two wards from bursting.
 *
 * **What this argues.** That a seam should *come from* the body: a crack of
 * light with something hot behind it, the stone scorched dark along both
 * sides, the colour spilling out over the scorch and a warm white core inside
 * it, breathing. And that a ward should change it — every sector the shield
 * takes off leaves the body less contained, so the joints burn wider and
 * brighter as the ball opens, and the skeleton left after two wards glows at
 * every seam rather than merely standing outlined. The colour is exactly the
 * shipped one and the white never exceeds half a seam, so a red ball and a
 * cyan ball stay the two words the pair says to each other. The stone and the
 * rim are the shipped ones.
 *
 * **How it can lose.** *A breathing seam reads as a signal.* Everything on
 * this field that pulses is telling the pair something — a lobe filling, a
 * pilot flame before a run. If the breath here reads as a *tell* about when
 * the ball will move or which way, it is a lie in the game's own vocabulary
 * and goes; the seams would then burn steadily and only `open` would move
 * them.
 */
export const VOLLEY_EMBER: Variant = {
  slot: "creature:volley",
  name: "ember",
  sentence:
    "each seam as the body inside burning through the joint — stone scorched along both sides, the colour spilling over the scorch with a warm white core, breathing, and every ward the shield lands makes the joints burn wider and brighter",
  dir: "tools/versus/candidates/creature-volley/ember",
  patches: [
    patch({
      target: volleyLook.VOLLEY_LOOK,
      reached: () => volleyLook.VOLLEY_LOOK,
      where: {
        file: "packages/render/src/volley-look.ts",
        symbol: "VOLLEY_LOOK",
        type: "VolleyLook",
      },
      // The stone is the shipped one: this slot patches both fields because
      // every candidate in it must, and this answer is about the seams alone.
      fields: { stone: shippedStone, seams: emberSeams },
    }),
  ],
};
