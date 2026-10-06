import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintFlesh, REACH } from "./paint.js";

/**
 * FLESH — offered 6 October 2026, for the owner's ask on the shot's mark
 * (`sight/index.ts` quotes it). The cannon is a lobe of the ship, so the
 * mark is made of it: a slime ring of the ship's own flesh, the hull's body
 * colours inside and the cannon's exact colour on its rim, its four lobes
 * standing where the ticks stood and swelling slowly. The target shows
 * through the hole in the middle; the grey scan box goes.
 */
export const AIM_FLESH: Variant = {
  slot: "aim:cannon",
  name: "flesh",
  sentence:
    "flesh — a slime ring of the ship's own body round the target, rimmed in the cannon's exact colour, its four lobes slowly swelling, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/flesh",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintFlesh, boxed: false, reach: REACH },
    }),
  ],
};
