import * as glance from "../../../../../packages/render/src/filament-glance.js";
import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `filament:glance`: SWAY, LOOK and COCK.
 */
export const FILAMENT_LOOK_AROUND: Variant = {
  slot: "filament:glance",
  name: "look",
  sentence:
    "look — the heart holds a look to one side, then the other, turning briskly between them about its apex, tilted toward where it looks.",
  dir: "tools/versus/candidates/filament-glance/look",
  patches: [
    patch({
      target: glance.FILAMENT_GLANCE,
      reached: () => glance.FILAMENT_GLANCE,
      where: {
        file: "packages/render/src/filament-glance.ts",
        symbol: "FILAMENT_GLANCE",
        type: "Glance",
      },
      fields: glanceOf(look, glance.FILAMENT_GLANCE_SIZE),
    }),
  ],
};
