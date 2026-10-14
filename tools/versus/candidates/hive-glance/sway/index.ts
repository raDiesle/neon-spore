import { glanceOf, sway } from "../../../../../packages/render/src/glance-styles.js";
import * as glance from "../../../../../packages/render/src/hive-glance.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 14 October 2026, from the owner's ask of 9 and 10 October:
 * *body parts of living things turn ... or if mechanical the full boss shape*.
 * One of three answers in `hive:glance`: SWAY, LOOK and COCK.
 */
export const HIVE_SWAY: Variant = {
  slot: "hive:glance",
  name: "sway",
  sentence:
    "sway — every lobe hung under the hive turns from showing its left side to its right and back on one slow sine, each on its own thread and none in step.",
  dir: "tools/versus/candidates/hive-glance/sway",
  patches: [
    patch({
      target: glance.HIVE_GLANCE,
      reached: () => glance.HIVE_GLANCE,
      where: { file: "packages/render/src/hive-glance.ts", symbol: "HIVE_GLANCE", type: "Glance" },
      fields: glanceOf(sway, glance.HIVE_GLANCE_SIZE),
    }),
  ],
};
