import * as aim from "../../../../../packages/render/src/cue-helper.js";
import { patch, type Variant } from "../../../variant.js";
import { paintSight, REACH } from "./paint.js";

/**
 * SIGHT — offered 6 October 2026, the owner: *Verbessere den Indikator bei
 * Bossen, wenn man an eine Stelle schießen muss (ein Fadenkreuz in der Farbe
 * der Cannon) … die exakte Farbe muss sich wieder finden.* Today's crosshair
 * kept, drawn in the cannon's exact colour (`skin.tint`, the colour of the
 * cannon's column), with four corner brackets of the same colour where the
 * grey scan box stood and a dashed ring turning slowly round it.
 */
export const AIM_SIGHT: Variant = {
  slot: "aim:cannon",
  name: "sight",
  sentence:
    "sight — the crosshair in the cannon's exact colour, framed by four brackets of it instead of the grey box, a dashed ring turning slowly round it",
  dir: "tools/versus/candidates/aim-cannon/sight",
  patches: [
    patch({
      target: aim.AIM_LOOK,
      reached: () => aim.AIM_LOOK,
      where: { file: "packages/render/src/cue-helper.ts", symbol: "AIM_LOOK" },
      fields: { paint: paintSight, boxed: false, reach: REACH },
    }),
  ],
};
