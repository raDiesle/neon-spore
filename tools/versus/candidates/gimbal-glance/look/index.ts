import * as glance from "../../../../../packages/render/src/gimbal-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `gimbal:glance`: SWAY, LOOK and COCK.
 */
export const GIMBAL_LOOK_AROUND: Variant = {
  slot: "gimbal:glance",
  name: "look",
  sentence:
    "The whole cradle turns to look one way and holds — then the other, its far rim darkening as it goes.",
  dir: "tools/versus/candidates/gimbal-glance/look",
  patches: [
    patch({
      target: glance.GIMBAL_GLANCE,
      reached: () => glance.GIMBAL_GLANCE,
      where: {
        file: "packages/render/src/gimbal-glance.ts",
        symbol: "GIMBAL_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.GIMBAL_GLANCE_SIZE),
    }),
  ],
};
