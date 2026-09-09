import * as interior from "../../../../../packages/render/src/body-interior.js";
import { patch, type Variant } from "../../../variant.js";
import { chambers } from "./paint.js";

/**
 * `creature:bulb` / `chambers` — the lobes are rooms.
 *
 * **What the shipped side is.** One dot, in the rim colour, a third of the way
 * down. The bulb's six lobes are deep enough to be counted from across the
 * field and nothing inside the body has ever agreed with them.
 *
 * **What this argues.** That the count is structural: six chambers, one under
 * each lobe, each on a neck to a hub, turning. A player who has learned to
 * count the lobes has learned something about the inside too.
 *
 * **How it can lose.** *Six of anything at twenty-six pixels is a texture.* The
 * bulb's own history is exactly this — nine lobes at a shallow depth was a rim
 * that moved seven pixels and read as noise, which is why it has six deep ones.
 * If six chambers do the same thing to the interior, this has repeated a
 * mistake the silhouette already made and corrected.
 */
export const BULB_CHAMBERS: Variant = {
  slot: "creature:bulb",
  name: "chambers",
  sentence:
    "six chambers on necks to a hub, one under each lobe — the count is structural, not a texture",
  dir: "tools/versus/candidates/creature-bulb/chambers",
  patches: [
    patch({
      target: interior.BULB_LOOK,
      reached: () => interior.interiorFor("bulb"),
      where: {
        file: "packages/render/src/body-interior.ts",
        symbol: "BULB_LOOK",
        type: "BodyInterior",
      },
      fields: { paint: chambers },
    }),
  ],
};
