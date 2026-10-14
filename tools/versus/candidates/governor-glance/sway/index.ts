import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/governor-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `governor:glance`: SWAY, LOOK and COCK.
 */
export const GOVERNOR_SWAY: Variant = {
  slot: "governor:glance",
  name: "sway",
  sentence:
    "The governor's tower swings slowly on its foot behind the dial — its far side going away into the dark and coming back.",
  dir: "tools/versus/candidates/governor-glance/sway",
  patches: [
    patch({
      target: glance.GOVERNOR_GLANCE,
      reached: () => glance.GOVERNOR_GLANCE,
      where: {
        file: "packages/render/src/governor-glance.ts",
        symbol: "GOVERNOR_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.GOVERNOR_GLANCE_SIZE),
    }),
  ],
};
