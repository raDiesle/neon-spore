import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/vise-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `vise:glance`: SWAY, LOOK and COCK.
 */
export const VISE_SWAY: Variant = {
  slot: "vise:glance",
  name: "sway",
  sentence:
    "The whole seed-case swings slowly on its spine — its far lobe going away into the dark and coming back.",
  dir: "tools/versus/candidates/vise-glance/sway",
  patches: [
    patch({
      target: glance.VISE_GLANCE,
      reached: () => glance.VISE_GLANCE,
      where: {
        file: "packages/render/src/vise-glance.ts",
        symbol: "VISE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.VISE_GLANCE_SIZE),
    }),
  ],
};
