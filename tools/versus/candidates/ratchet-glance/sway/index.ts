import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/ratchet-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `ratchet:glance`: SWAY, LOOK and COCK.
 */
export const RATCHET_SWAY: Variant = {
  slot: "ratchet:glance",
  name: "sway",
  sentence:
    "The rack swings slowly in its strut — each plate's far half going away into the dark and coming back.",
  dir: "tools/versus/candidates/ratchet-glance/sway",
  patches: [
    patch({
      target: glance.RATCHET_GLANCE,
      reached: () => glance.RATCHET_GLANCE,
      where: {
        file: "packages/render/src/ratchet-glance.ts",
        symbol: "RATCHET_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.RATCHET_GLANCE_SIZE),
    }),
  ],
};
