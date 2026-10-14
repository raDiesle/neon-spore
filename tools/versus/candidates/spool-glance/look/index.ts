import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/spool-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `spool:glance`: SWAY, LOOK and COCK.
 */
export const SPOOL_LOOK_AROUND: Variant = {
  slot: "spool:glance",
  name: "look",
  sentence:
    "The whole spool turns its far end away and holds there — then brings it round toward the pair and holds again.",
  dir: "tools/versus/candidates/spool-glance/look",
  patches: [
    patch({
      target: glance.SPOOL_GLANCE,
      reached: () => glance.SPOOL_GLANCE,
      where: {
        file: "packages/render/src/spool-glance.ts",
        symbol: "SPOOL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.SPOOL_GLANCE_SIZE),
    }),
  ],
};
