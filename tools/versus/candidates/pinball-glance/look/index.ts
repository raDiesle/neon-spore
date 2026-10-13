import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/pinball-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 13 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `pinball:glance`: SWAY, LOOK and COCK.
 */
export const PINBALL_LOOK_AROUND: Variant = {
  slot: "pinball:glance",
  name: "look",
  sentence:
    "look — every amber target holds a look ahead, to the left, ahead and to the right, turning briskly between them and leaning toward where it looks.",
  dir: "tools/versus/candidates/pinball-glance/look",
  patches: [
    patch({
      target: glance.PINBALL_GLANCE,
      reached: () => glance.PINBALL_GLANCE,
      where: {
        file: "packages/render/src/pinball-glance.ts",
        symbol: "PINBALL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.PINBALL_GLANCE_SIZE),
    }),
  ],
};
