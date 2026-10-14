import { glanceOf, look } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/hive-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * LOOK — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `hive:glance`: SWAY, LOOK and COCK.
 */
export const HIVE_LOOK_AROUND: Variant = {
  slot: "hive:glance",
  name: "look",
  sentence:
    "look — every lobe holds a turn ahead, to the left, ahead and to the right, turning briskly between them and swinging its tip toward where it turns.",
  dir: "tools/versus/candidates/hive-glance/look",
  patches: [
    patch({
      target: glance.HIVE_GLANCE,
      reached: () => glance.HIVE_GLANCE,
      where: { file: "packages/render/src/hive-glance.ts", symbol: "HIVE_GLANCE", type: "Glance" },
      fields: glanceOf(look, glance.HIVE_GLANCE_SIZE),
    }),
  ],
};
