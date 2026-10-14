import * as glance from "../../../../../packages/render/src/gimbal-glance.js";
import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gimbal:glance`: SWAY, LOOK and COCK.
 */
export const GIMBAL_SWAY: Variant = {
  slot: "gimbal:glance",
  name: "sway",
  sentence:
    "The whole cradle swings slowly side to side in its yoke — a machine that is awake, steadying when the marks come up.",
  dir: "tools/versus/candidates/gimbal-glance/sway",
  patches: [
    patch({
      target: glance.GIMBAL_GLANCE,
      reached: () => glance.GIMBAL_GLANCE,
      where: {
        file: "packages/render/src/gimbal-glance.ts",
        symbol: "GIMBAL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(sway, glance.GIMBAL_GLANCE_SIZE),
    }),
  ],
};
