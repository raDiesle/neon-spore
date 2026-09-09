import * as silhouettes from "../../../../../packages/content/src/silhouettes.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `bulb:shape` / `pebble` — almost nothing.
 *
 * **What this argues.** That the bulb should be the body with *no feature at
 * all*. Three lobes so shallow they are barely a departure from a circle, and a
 * wobble larger than the lobes, so what a player sees is a soft round thing
 * that breathes. Every other body on the field is trying to be recognised by a
 * count or a point; this one is recognised by having nothing to recognise.
 *
 * **It is the opposite end of this slot from SPIKE**, and the two are here
 * together for that reason: the question the pair is really being asked is
 * whether the first round body should be busy or plain.
 *
 * **How it can lose.** *A circle is a rock.* THE METEOR is the body drawn as a
 * hard round thing, and a bulb with its lobes taken away is a soft one at the
 * same size — the difference then rests entirely on the material and the
 * colour, and the colour is fixed.
 */
export const BULB_PEBBLE: Variant = {
  slot: "bulb:shape",
  name: "pebble",
  sentence:
    "SMOKE's edge on the bulb — lobes so shallow they are barely there under a wobble that blurs them",
  dir: "tools/versus/candidates/bulb-shape/pebble",
  patches: [
    patch({
      target: silhouettes.BULB,
      reached: () => silhouettes.BULB,
      where: {
        file: "packages/content/src/silhouettes.ts",
        symbol: "BULB",
        type: "CreatureSilhouette",
      },
      fields: { lobes: 6, depth: 0.07, wobble: 0.17, rx: 54, ry: 50, seed: 7.4 },
    }),
  ],
};
