import * as glance from "../../../../../packages/render/src/gimbal-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gimbal:glance`: SWAY, LOOK and COCK.
 */
export const GIMBAL_COCK: Variant = {
  slot: "gimbal:glance",
  name: "cock",
  sentence:
    "The whole cradle turns and rolls over a little as it does — a head cocked in its yoke — and holds before it turns back.",
  dir: "tools/versus/candidates/gimbal-glance/cock",
  patches: [
    patch({
      target: glance.GIMBAL_GLANCE,
      reached: () => glance.GIMBAL_GLANCE,
      where: {
        file: "packages/render/src/gimbal-glance.ts",
        symbol: "GIMBAL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.GIMBAL_GLANCE_SIZE),
    }),
  ],
};
