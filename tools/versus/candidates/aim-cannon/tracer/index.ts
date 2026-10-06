import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintTracer, REACH } from "./paint.js";

/**
 * TRACER — offered 6 October 2026, for the owner's ask on the shot's mark
 * (`sight/index.ts` quotes it). The mark says whose it is by being joined
 * to it: a dotted line in the cannon's exact colour runs from the muzzle up
 * to the target — up the column, then across where the shot turns a corner —
 * into a crosshair of the same colour. The dots stand still and brighten
 * together; nothing travels up the column, which is what a bolt does
 * (`cannon-column.ts`). The grey scan box goes.
 */
export const AIM_TRACER: Variant = {
  slot: "aim:cannon",
  name: "tracer",
  sentence:
    "tracer — a dotted line in the cannon's exact colour joins the muzzle to the target, ending in a crosshair of the same colour, and no grey box",
  dir: "tools/versus/candidates/aim-cannon/tracer",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintTracer, boxed: false, reach: REACH },
    }),
  ],
};
