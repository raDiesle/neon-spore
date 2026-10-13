import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/warden-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `warden:glance`: SWAY, LOOK and COCK.
 */
export const WARDEN_SWAY: Variant = {
  slot: "warden:glance",
  name: "sway",
  sentence:
    "sway — THE WARDEN's body slowly turns about its eye toward one side and then the other, that side bunching and going dark and the other opening, while the eye, its hatch and the rope stay where they are",
  dir: "tools/versus/candidates/warden-glance/sway",
  patches: [
    patch({
      target: glance.WARDEN_GLANCE,
      reached: () => glance.WARDEN_GLANCE,
      where: {
        file: "packages/render/src/warden-glance.ts",
        symbol: "WARDEN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.WARDEN_GLANCE_SIZE),
    }),
  ],
};
