import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/keel-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `keel:glance`: SWAY, LOOK and COCK.
 */
export const KEEL_LOOK_AROUND: Variant = {
  slot: "keel:glance",
  name: "look",
  sentence:
    "Every vertebra of the spine turns on its joint and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/keel-glance/look",
  patches: [
    patch({
      target: glance.KEEL_GLANCE,
      reached: () => glance.KEEL_GLANCE,
      where: {
        file: "packages/render/src/keel-glance.ts",
        symbol: "KEEL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.KEEL_GLANCE_SIZE),
    }),
  ],
};
