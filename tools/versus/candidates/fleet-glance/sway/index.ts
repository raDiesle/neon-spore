import * as glance from "../../../../../packages/render/src/fleet-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `fleet:glance`: SWAY, LOOK and COCK.
 */
export const FLEET_SWAY: Variant = {
  slot: "fleet:glance",
  name: "sway",
  sentence:
    "sway — every hull turns from showing its bow to showing its stern and back on one slow sine, its ends held on their squares.",
  dir: "tools/versus/candidates/fleet-glance/sway",
  patches: [
    patch({
      target: glance.FLEET_GLANCE,
      reached: () => glance.FLEET_GLANCE,
      where: {
        file: "packages/render/src/fleet-glance.ts",
        symbol: "FLEET_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.FLEET_GLANCE_SIZE),
    }),
  ],
};
