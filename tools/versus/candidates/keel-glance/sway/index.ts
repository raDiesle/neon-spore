import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/keel-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `keel:glance`: SWAY, LOOK and COCK.
 */
export const KEEL_SWAY: Variant = {
  slot: "keel:glance",
  name: "sway",
  sentence:
    "Every vertebra of the spine swings slowly on its joint — each far end going away into the dark and coming back.",
  dir: "tools/versus/candidates/keel-glance/sway",
  patches: [
    patch({
      target: glance.KEEL_GLANCE,
      reached: () => glance.KEEL_GLANCE,
      where: {
        file: "packages/render/src/keel-glance.ts",
        symbol: "KEEL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.KEEL_GLANCE_SIZE),
    }),
  ],
};
