import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintPlasma, REACH } from "./paint.js";

/**
 * PLASMA — offered 6 October 2026, the owner's second answer on the
 * shot's mark: *create more variants, it should look more cool, again colour
 * of either cyan or the red of cannon button must be clear. maybe some more
 * neon and more living, it looks too much geometric like straight lines.
 * maybe with more unevenness.* In the red of the fire button,
 * `PALETTE.red` exactly. A ring of fire round the target: twenty-six flames, each flickering at its own pace and leaning as it turns, over a lumpy core of neon. The grey scan box goes.
 */
export const AIM_PLASMA: Variant = {
  slot: "aim:cannon",
  name: "plasma",
  sentence:
    "plasma — a ring of red fire, the fire button's red, round the target: flames that flicker and lean as they turn, over a lumpy neon core, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/plasma",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintPlasma, boxed: false, reach: REACH },
    }),
  ],
};
