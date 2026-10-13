import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/pulse-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `pulse:glance`: SWAY, LOOK and COCK.
 */
export const PULSE_SWAY: Variant = {
  slot: "pulse:glance",
  name: "sway",
  sentence:
    "sway — every slick, bulb and pod turns from showing its left side to its right and back on one slow sine as it falls, its centre still meeting its socket.",
  dir: "tools/versus/candidates/pulse-glance/sway",
  patches: [
    patch({
      target: glance.PULSE_GLANCE,
      reached: () => glance.PULSE_GLANCE,
      where: {
        file: "packages/render/src/pulse-glance.ts",
        symbol: "PULSE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.PULSE_GLANCE_SIZE),
    }),
  ],
};
