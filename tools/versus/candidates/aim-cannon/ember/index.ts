import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintEmber, REACH } from "./paint.js";

/**
 * EMBER — offered 6 October 2026, the owner's second answer on the
 * shot's mark: *create more variants, it should look more cool, again colour
 * of either cyan or the red of cannon button must be clear. maybe some more
 * neon and more living, it looks too much geometric like straight lines.
 * maybe with more unevenness.* In the red of the fire button,
 * `PALETTE.red` exactly. A ring of neon that never sits still, three slow waves running round it, pierced by four curved fangs that sway and reach in at the target. The grey scan box goes.
 */
export const AIM_EMBER: Variant = {
  slot: "aim:cannon",
  name: "ember",
  sentence:
    "ember — a wobbling ring of red neon, the fire button's red, pierced by four curved fangs that sway and reach in at the target, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/ember",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintEmber, boxed: false, reach: REACH },
    }),
  ],
};
