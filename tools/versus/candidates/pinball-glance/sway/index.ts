import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/pinball-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `pinball:glance`: SWAY, LOOK and COCK.
 */
export const PINBALL_SWAY: Variant = {
  slot: "pinball:glance",
  name: "sway",
  sentence:
    "sway — every amber target turns from showing its left side to its right and back on one slow sine, about a centre the ball still bounces off.",
  dir: "tools/versus/candidates/pinball-glance/sway",
  patches: [
    patch({
      target: glance.PINBALL_GLANCE,
      reached: () => glance.PINBALL_GLANCE,
      where: {
        file: "packages/render/src/pinball-glance.ts",
        symbol: "PINBALL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.PINBALL_GLANCE_SIZE),
    }),
  ],
};
