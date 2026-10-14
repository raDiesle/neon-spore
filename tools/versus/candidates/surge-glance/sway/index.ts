import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/surge-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `surge:glance`: SWAY, LOOK and COCK.
 */
export const SURGE_SWAY: Variant = {
  slot: "surge:glance",
  name: "sway",
  sentence:
    "sway — the bulb turns from showing its left flank to its right and back on one slow sine, about its middle, with the grip marks held where the thumbs land.",
  dir: "tools/versus/candidates/surge-glance/sway",
  patches: [
    patch({
      target: glance.SURGE_GLANCE,
      reached: () => glance.SURGE_GLANCE,
      where: {
        file: "packages/render/src/surge-glance.ts",
        symbol: "SURGE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.SURGE_GLANCE_SIZE),
    }),
  ],
};
