import * as glance from "../../../../../packages/render/src/fleet-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `fleet:glance`: SWAY, LOOK and COCK.
 */
export const FLEET_LOOK_AROUND: Variant = {
  slot: "fleet:glance",
  name: "look",
  sentence:
    "look — every hull holds a look abeam, astern, abeam and ahead, turning briskly between them and leaning toward the end it shows.",
  dir: "tools/versus/candidates/fleet-glance/look",
  patches: [
    patch({
      target: glance.FLEET_GLANCE,
      reached: () => glance.FLEET_GLANCE,
      where: {
        file: "packages/render/src/fleet-glance.ts",
        symbol: "FLEET_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.FLEET_GLANCE_SIZE),
    }),
  ],
};
