import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mantle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mantle:glance`: SWAY, LOOK and COCK.
 */
export const MANTLE_LOOK_AROUND: Variant = {
  slot: "mantle:glance",
  name: "look",
  sentence:
    "The whole shell turns to one side on its straps and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/mantle-glance/look",
  patches: [
    patch({
      target: glance.MANTLE_GLANCE,
      reached: () => glance.MANTLE_GLANCE,
      where: {
        file: "packages/render/src/mantle-glance.ts",
        symbol: "MANTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.MANTLE_GLANCE_SIZE),
    }),
  ],
};
