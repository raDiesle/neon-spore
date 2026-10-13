import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/pulse-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `pulse:glance`: SWAY, LOOK and COCK.
 */
export const PULSE_LOOK_AROUND: Variant = {
  slot: "pulse:glance",
  name: "look",
  sentence:
    "look — every slick, bulb and pod holds a look ahead, to the left, ahead and to the right as it falls, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/pulse-glance/look",
  patches: [
    patch({
      target: glance.PULSE_GLANCE,
      reached: () => glance.PULSE_GLANCE,
      where: {
        file: "packages/render/src/pulse-glance.ts",
        symbol: "PULSE_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.PULSE_GLANCE_SIZE),
    }),
  ],
};
