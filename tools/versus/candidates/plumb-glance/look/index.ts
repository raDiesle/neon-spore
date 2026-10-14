import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/plumb-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `plumb:glance`: SWAY, LOOK and COCK.
 */
export const PLUMB_LOOK_AROUND: Variant = {
  slot: "plumb:glance",
  name: "look",
  sentence:
    "The bob's sac turns to one side under the beam and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/plumb-glance/look",
  patches: [
    patch({
      target: glance.PLUMB_GLANCE,
      reached: () => glance.PLUMB_GLANCE,
      where: {
        file: "packages/render/src/plumb-glance.ts",
        symbol: "PLUMB_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.PLUMB_GLANCE_SIZE),
    }),
  ],
};
