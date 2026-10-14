import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/sinew-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `sinew:glance`: SWAY, LOOK and COCK.
 */
export const SINEW_SWAY: Variant = {
  slot: "sinew:glance",
  name: "sway",
  sentence:
    "sway — the mass turns from showing its left side to its right and back on one slow sine, about the centre its handles rest beside.",
  dir: "tools/versus/candidates/sinew-glance/sway",
  patches: [
    patch({
      target: glance.SINEW_GLANCE,
      reached: () => glance.SINEW_GLANCE,
      where: {
        file: "packages/render/src/sinew-glance.ts",
        symbol: "SINEW_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.SINEW_GLANCE_SIZE),
    }),
  ],
};
