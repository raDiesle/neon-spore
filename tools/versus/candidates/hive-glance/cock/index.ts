import { cock, glanceOf } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/hive-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * COCK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `hive:glance`: SWAY, LOOK and COCK.
 */
export const HIVE_COCK: Variant = {
  slot: "hive:glance",
  name: "cock",
  sentence:
    "cock — every lobe turns left and right on the sine and swings its tip side to side three times a round about where it hangs, like drops stirred by a draught.",
  dir: "tools/versus/candidates/hive-glance/cock",
  patches: [
    patch({
      target: glance.HIVE_GLANCE,
      reached: () => glance.HIVE_GLANCE,
      where: { file: "packages/render/src/hive-glance.ts", symbol: "HIVE_GLANCE", type: "Glance" },
      fields: glanceOf(cock, glance.HIVE_GLANCE_SIZE),
    }),
  ],
};
