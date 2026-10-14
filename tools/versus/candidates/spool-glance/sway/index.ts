import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/spool-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `spool:glance`: SWAY, LOOK and COCK.
 */
export const SPOOL_SWAY: Variant = {
  slot: "spool:glance",
  name: "sway",
  sentence:
    "The whole spool swings slowly about the brake's flange — its far end going away into the dark and coming back.",
  dir: "tools/versus/candidates/spool-glance/sway",
  patches: [
    patch({
      target: glance.SPOOL_GLANCE,
      reached: () => glance.SPOOL_GLANCE,
      where: {
        file: "packages/render/src/spool-glance.ts",
        symbol: "SPOOL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.SPOOL_GLANCE_SIZE),
    }),
  ],
};
