import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintIris, REACH } from "./paint.js";

/**
 * IRIS — offered 6 October 2026, the owner's second answer on the
 * shot's mark: *create more variants, it should look more cool, again colour
 * of either cyan or the red of cannon button must be clear. maybe some more
 * neon and more living, it looks too much geometric like straight lines.
 * maybe with more unevenness.* In the cyan of the fire button,
 * `PALETTE.cyan` exactly. Nine hooked teeth round the target, no two the same size, each opening and biting in on its own beat, on a rim that breathes. The grey scan box goes.
 */
export const AIM_IRIS: Variant = {
  slot: "aim:cannon",
  name: "iris",
  sentence:
    "iris — a living mouth of hooked cyan teeth, the fire button's cyan, each its own size, opening and biting in at the target on a breathing rim, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/iris",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintIris, boxed: false, reach: REACH },
    }),
  ],
};
