import * as glance from "../../../../../packages/render/src/bastion-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `bastion:glance`: SWAY, LOOK and COCK.
 */
export const BASTION_COCK: Variant = {
  slot: "bastion:glance",
  name: "cock",
  sentence: "The moon turns to one side and tips as it does — and holds before it turns back.",
  dir: "tools/versus/candidates/bastion-glance/cock",
  patches: [
    patch({
      target: glance.BASTION_GLANCE,
      reached: () => glance.BASTION_GLANCE,
      where: {
        file: "packages/render/src/bastion-glance.ts",
        symbol: "BASTION_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.BASTION_GLANCE_SIZE),
    }),
  ],
};
