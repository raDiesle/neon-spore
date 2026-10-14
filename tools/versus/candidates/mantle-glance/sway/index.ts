import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/mantle-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `mantle:glance`: SWAY, LOOK and COCK.
 */
export const MANTLE_SWAY: Variant = {
  slot: "mantle:glance",
  name: "sway",
  sentence:
    "The whole shell swings slowly about its middle — its far valve going away into the dark and coming back.",
  dir: "tools/versus/candidates/mantle-glance/sway",
  patches: [
    patch({
      target: glance.MANTLE_GLANCE,
      reached: () => glance.MANTLE_GLANCE,
      where: {
        file: "packages/render/src/mantle-glance.ts",
        symbol: "MANTLE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.MANTLE_GLANCE_SIZE),
    }),
  ],
};
