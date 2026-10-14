import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mimic-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mimic:glance`: SWAY, LOOK and COCK.
 */
export const MIMIC_LOOK_AROUND: Variant = {
  slot: "mimic:glance",
  name: "look",
  sentence:
    "The mantle turns to look one way and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/mimic-glance/look",
  patches: [
    patch({
      target: glance.MIMIC_GLANCE,
      reached: () => glance.MIMIC_GLANCE,
      where: {
        file: "packages/render/src/mimic-glance.ts",
        symbol: "MIMIC_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.MIMIC_GLANCE_SIZE),
    }),
  ],
};
