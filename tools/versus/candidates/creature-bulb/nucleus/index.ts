import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { nucleus } from "./paint.js";

/**
 * `creature:bulb` / `nucleus` — one heavy thing, loose in a shell.
 *
 * **What this argues.** That the bulb is hollow. One dense core, off centre,
 * going slowly round inside the body and passing behind the middle, with the
 * mark it has left on the far wall showing through when it is on the near side.
 * It is the smallest interior of the five on purpose: where CHAMBERS fills the
 * body and SPORES packs it, this puts one object in it and gives that object a
 * place to be.
 *
 * **It is the one candidate here where something occludes something else**,
 * which is the cheapest depth cue there is and the one no still can show.
 *
 * **How it can lose.** *A single moving dot is a cursor.* The eye follows it,
 * and on a field where the pair is reading columns a body with a travelling
 * point in it may pull attention off the thing that matters. Watch it on a
 * wave with several bulbs in it rather than on one body.
 */
export const BULB_NUCLEUS: Variant = {
  slot: "creature:bulb",
  name: "nucleus",
  sentence:
    "one dense core going round inside the shell — it passes behind the middle and comes back",
  dir: "tools/versus/candidates/creature-bulb/nucleus",
  patches: [
    patch({
      target: interior.BULB_LOOK,
      reached: () => interior.interiorFor("bulb"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "BULB_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: nucleus },
    }),
  ],
};
