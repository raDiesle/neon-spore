import * as glance from "../../../../../packages/render/src/bastion-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `bastion:glance`: SWAY, LOOK and COCK.
 */
export const BASTION_LOOK_AROUND: Variant = {
  slot: "bastion:glance",
  name: "look",
  sentence:
    "The moon turns to look one way and holds there — then comes round the other way and holds again.",
  dir: "tools/versus/candidates/bastion-glance/look",
  patches: [
    patch({
      target: glance.BASTION_GLANCE,
      reached: () => glance.BASTION_GLANCE,
      where: {
        file: "packages/render/src/bastion-glance.ts",
        symbol: "BASTION_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.BASTION_GLANCE_SIZE),
    }),
  ],
};
