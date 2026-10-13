import * as glance from "../../../../../packages/render/src/fleet-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `fleet:glance`: SWAY, LOOK and COCK.
 */
export const FLEET_COCK: Variant = {
  slot: "fleet:glance",
  name: "cock",
  sentence:
    "cock — every hull turns bow to stern on the sine and rocks on its keel three times a round, like a ship riding a swell at anchor.",
  dir: "tools/versus/candidates/fleet-glance/cock",
  patches: [
    patch({
      target: glance.FLEET_GLANCE,
      reached: () => glance.FLEET_GLANCE,
      where: {
        file: "packages/render/src/fleet-glance.ts",
        symbol: "FLEET_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.FLEET_GLANCE_SIZE),
    }),
  ],
};
