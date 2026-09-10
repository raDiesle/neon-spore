import * as chuteLook from "../../../../../packages/render/src/chute-look.js";
import { patch, type Variant } from "../../../variant.js";
import { belled, jet } from "./paint.js";

/**
 * `creature:chute` / `bell` — it is not a parachute, it is the animal that
 * swims by being one.
 *
 * **What the shipped side is.** A bellied curve at low alpha with a bright rim,
 * leaning on a slow sway and breathing by six per cent, over a body it is
 * plainly *above* rather than part of. The file already argues that this thing
 * is a membrane and not fabric; the drawing does not go on to say what a
 * membrane is made of.
 *
 * **What this argues.** That a translucent shell is proved by two things and
 * neither of them is alpha. Its **far wall**, seen through the near one and lit
 * on the *inside* — bright where a solid is dark, which is the only cue that
 * says light went through this and came back. And its **curl**, the hem turning
 * under itself so the rim is thickest along the bottom edge and gone by the
 * crown. And it *works*: the dome squeezes narrow and deep on its own stroke
 * and opens again, so the pair reads a thing swimming rather than a thing being
 * blown about. The plume becomes the ring a bell expels — two lit walls with a
 * dark core between them, which a wedge cannot say.
 *
 * **How it can lose.** *It stops reading as a canopy.* A pulsing bell is a
 * jellyfish, and the sentence this creature has to say at twenty-six pixels is
 * *this one is coming down slowly and still has to be shot*. A body that looks
 * like it is swimming under its own power argues the opposite. `chute-cut.ts`
 * also cuts the shipped dome loose on the kill: if the bell wins, the piece
 * that climbs away has to squeeze as it goes or the two will not be the same
 * object.
 */
export const CHUTE_BELL: Variant = {
  slot: "creature:chute",
  name: "bell",
  sentence:
    "the dome as a translucent bell — its far wall seen through the near one and lit on the inside, its hem curled under, squeezing narrow and deep on its own stroke — over a ring of jet with a dark core",
  dir: "tools/versus/candidates/creature-chute/bell",
  patches: [
    patch({
      target: chuteLook.CHUTE_LOOK,
      // No accessor: `chute.ts` reads the export itself, once per body.
      reached: () => chuteLook.CHUTE_LOOK,
      where: {
        file: "packages/render/src/chute-look.ts",
        symbol: "CHUTE_LOOK",
        type: "ChuteLook",
      },
      fields: { canopy: belled, plume: jet },
    }),
  ],
};
