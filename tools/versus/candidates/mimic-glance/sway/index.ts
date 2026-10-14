import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mimic-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mimic:glance`: SWAY, LOOK and COCK.
 */
export const MIMIC_SWAY: Variant = {
  slot: "mimic:glance",
  name: "sway",
  sentence:
    "The mantle turns slowly from side to side over the field — its far side going into the dark and coming back.",
  dir: "tools/versus/candidates/mimic-glance/sway",
  patches: [
    patch({
      target: glance.MIMIC_GLANCE,
      reached: () => glance.MIMIC_GLANCE,
      where: {
        file: "packages/render/src/mimic-glance.ts",
        symbol: "MIMIC_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.MIMIC_GLANCE_SIZE),
    }),
  ],
};
