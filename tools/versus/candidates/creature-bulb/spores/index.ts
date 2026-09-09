import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { spores } from "./paint.js";

/**
 * `creature:bulb` / `spores` — the body is a spore case, and it is full.
 *
 * **What this argues.** The creature is called a bulb, the game is called Neon
 * Spore, and the body has never looked like it was carrying anything. Eleven
 * spheres packed through the whole volume — three shells deep, not one — so
 * the near ones are large and bright and the deep ones small and dim, and the
 * packing turns.
 *
 * **It is the one of the five that is about volume**, which is the thing a flat
 * fill cannot say at all. NUCLEUS puts one object in the shell, CHAMBERS hangs
 * six on the wall, and this fills the middle.
 *
 * **How it can lose.** *Eleven of anything on a body drawn at twenty-six pixels
 * is a stipple.* If a bulb stops reading as a bulb and starts reading as a
 * smudge, nothing else about this matters — and the pose that puts four kinds
 * on one frame is where that shows.
 */
export const BULB_SPORES: Variant = {
  slot: "creature:bulb",
  name: "spores",
  sentence:
    "eleven spheres packed three shells deep — a full case, with the near ones bright and the deep ones dim",
  dir: "tools/versus/candidates/creature-bulb/spores",
  patches: [
    patch({
      target: interior.BULB_LOOK,
      reached: () => interior.interiorFor("bulb"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "BULB_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: spores },
    }),
  ],
};
