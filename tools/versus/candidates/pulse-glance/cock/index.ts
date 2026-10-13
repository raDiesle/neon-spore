import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/pulse-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `pulse:glance`: SWAY, LOOK and COCK.
 */
export const PULSE_COCK: Variant = {
  slot: "pulse:glance",
  name: "cock",
  sentence:
    "cock — every slick, bulb and pod turns left and right on the sine as it falls and cocks itself side to side three times a round.",
  dir: "tools/versus/candidates/pulse-glance/cock",
  patches: [
    patch({
      target: glance.PULSE_GLANCE,
      reached: () => glance.PULSE_GLANCE,
      where: {
        file: "packages/render/src/pulse-glance.ts",
        symbol: "PULSE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.PULSE_GLANCE_SIZE),
    }),
  ],
};
