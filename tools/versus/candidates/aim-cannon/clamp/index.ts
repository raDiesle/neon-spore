import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintClamp, REACH } from "./paint.js";

/**
 * CLAMP — offered 6 October 2026, for the owner's ask on the shot's mark
 * (`sight/index.ts` quotes it). No ring: four solid arrowheads in the
 * cannon's exact colour close in on the target from its corners and ease
 * back out, a lock-on that keeps grabbing, round a diamond of the same
 * colour. The grey scan box goes; the arrowheads are the frame.
 */
export const AIM_CLAMP: Variant = {
  slot: "aim:cannon",
  name: "clamp",
  sentence:
    "clamp — four solid arrowheads in the cannon's exact colour keep closing in on the target from its corners, round a diamond of the same colour, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/clamp",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintClamp, boxed: false, reach: REACH },
    }),
  ],
};
