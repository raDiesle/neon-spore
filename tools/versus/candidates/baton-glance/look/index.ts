import * as glance from "../../../../../packages/render/src/baton-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `baton:glance`: SWAY, LOOK and COCK.
 */
export const BATON_LOOK_AROUND: Variant = {
  slot: "baton:glance",
  name: "look",
  sentence:
    "look — every knuckle holds a turn ahead, to the left, ahead and to the right, twisting briskly between them and leaning toward where it turns.",
  dir: "tools/versus/candidates/baton-glance/look",
  patches: [
    patch({
      target: glance.BATON_GLANCE,
      reached: () => glance.BATON_GLANCE,
      where: {
        file: "packages/render/src/baton-glance.ts",
        symbol: "BATON_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.BATON_GLANCE_SIZE),
    }),
  ],
};
