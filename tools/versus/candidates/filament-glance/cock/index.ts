import * as glance from "../../../../../packages/render/src/filament-glance.js";
import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `filament:glance`: SWAY, LOOK and COCK.
 */
export const FILAMENT_COCK: Variant = {
  slot: "filament:glance",
  name: "cock",
  sentence:
    "cock — the heart turns there and back about its apex and cocks side to side three times as fast, the veins still going in at the apex.",
  dir: "tools/versus/candidates/filament-glance/cock",
  patches: [
    patch({
      target: glance.FILAMENT_GLANCE,
      reached: () => glance.FILAMENT_GLANCE,
      where: {
        file: "packages/render/src/filament-glance.ts",
        symbol: "FILAMENT_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(cock, glance.FILAMENT_GLANCE_SIZE),
    }),
  ],
};
