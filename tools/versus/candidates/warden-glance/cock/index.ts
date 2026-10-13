import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/warden-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `warden:glance`: SWAY, LOOK and COCK.
 */
export const WARDEN_COCK: Variant = {
  slot: "warden:glance",
  name: "cock",
  sentence:
    "cock — THE WARDEN's body turns about its eye toward one side and the other and tips side to side three times as fast, so the horseshoe keeps changing its angle round an eye that never moves",
  dir: "tools/versus/candidates/warden-glance/cock",
  patches: [
    patch({
      target: glance.WARDEN_GLANCE,
      reached: () => glance.WARDEN_GLANCE,
      where: {
        file: "packages/render/src/warden-glance.ts",
        symbol: "WARDEN_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.WARDEN_GLANCE_SIZE),
    }),
  ],
};
