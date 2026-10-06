import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintSpores, REACH } from "./paint.js";

/**
 * SPORES — offered 6 October 2026, the owner's second answer on the
 * shot's mark: *create more variants, it should look more cool, again colour
 * of either cyan or the red of cannon button must be clear. maybe some more
 * neon and more living, it looks too much geometric like straight lines.
 * maybe with more unevenness.* In the red of the fire button,
 * `PALETTE.red` exactly. Fifteen glowing spores circle the target, each at its own speed and size and each trailing light, round a thin thread that breathes. The grey scan box goes.
 */
export const AIM_SPORES: Variant = {
  slot: "aim:cannon",
  name: "spores",
  sentence:
    "spores — a swarm of glowing red spores, the fire button's red, circling the target at their own speeds and sizes and trailing light, round a breathing thread, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/spores",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintSpores, boxed: false, reach: REACH },
    }),
  ],
};
