import * as glance from "../../../../../packages/render/src/flue-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `flue:glance`: SWAY, LOOK and COCK.
 */
export const FLUE_LOOK_AROUND: Variant = {
  slot: "flue:glance",
  name: "look",
  sentence:
    "Each lobe of the flue's flesh turns to look one way, one after the next, and holds — then comes round the other way.",
  dir: "tools/versus/candidates/flue-glance/look",
  patches: [
    patch({
      target: glance.FLUE_GLANCE,
      reached: () => glance.FLUE_GLANCE,
      where: {
        file: "packages/render/src/flue-glance.ts",
        symbol: "FLUE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.FLUE_GLANCE_SIZE),
    }),
  ],
};
