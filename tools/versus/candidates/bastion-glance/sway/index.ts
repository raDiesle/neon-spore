import * as glance from "../../../../../packages/render/src/bastion-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `bastion:glance`: SWAY, LOOK and COCK.
 */
export const BASTION_SWAY: Variant = {
  slot: "bastion:glance",
  name: "sway",
  sentence:
    "The moon turns slowly from side to side over the field — its far side going into the dark and coming back.",
  dir: "tools/versus/candidates/bastion-glance/sway",
  patches: [
    patch({
      target: glance.BASTION_GLANCE,
      reached: () => glance.BASTION_GLANCE,
      where: {
        file: "packages/render/src/bastion-glance.ts",
        symbol: "BASTION_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.BASTION_GLANCE_SIZE),
    }),
  ],
};
