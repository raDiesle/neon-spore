import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { filament } from "./paint.js";

/**
 * `creature:bulb` / `filament` — one thread, wound round the inside.
 *
 * **What this argues.** That the interior should have nothing to count in it.
 * CHAMBERS has six of something, SPORES has eleven, NUCLEUS has one; this has a
 * single continuous line wound from pole to pole round the inner wall, and the
 * only thing it says is *this body is a volume with something coiled in it*.
 *
 * **The turn is the whole of it.** Only the near half of the winding is drawn,
 * so the visible arc slides across the body as it turns — the reveal, which no
 * pose produces at any setting.
 *
 * **How it can lose.** *A thread is thin.* At the width a body this size
 * allows, the whole look is one hairline, and a hairline is what damage looks
 * like elsewhere in this game — a crack in a hull, a scar on a plate. If a bulb
 * starts reading as cracked, this is finished.
 */
export const BULB_FILAMENT: Variant = {
  slot: "creature:bulb",
  name: "filament",
  sentence:
    "one thread wound pole to pole round the inside — nothing to count, and the near half slides as it turns",
  dir: "tools/versus/candidates/creature-bulb/filament",
  patches: [
    patch({
      target: interior.BULB_LOOK,
      reached: () => interior.interiorFor("bulb"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "BULB_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: filament },
    }),
  ],
};
