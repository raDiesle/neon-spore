import * as gauge from "../../../../../packages/render/src/surge-gauge.js";
import { patch, type Variant } from "../../../variant.js";
import { paintGapingSeam } from "./paint.js";

/**
 * GAPE — offered 8 October 2026, the first of THE SURGE's three unbuilt looks
 * (bosses.md §11.28): the seam parting wider the more the bulb is charged.
 * The game draws one dark line round the equator on both screens and the
 * pressure as a white mark along it on the navigator's; this opens the line
 * itself on her screen, a lit mouth as wide as the charge is high.
 */
export const SURGE_GAPE: Variant = {
  slot: "surge:seam",
  name: "gape",
  sentence:
    "gape — on the navigator's screen the seam parts into a lit mouth as wide as the pressure is high; the pilot's line stays shut",
  dir: "tools/versus/candidates/surge-seam/gape",
  patches: [
    patch({
      target: gauge.SEAM_LOOK,
      reached: () => gauge.SEAM_LOOK,
      where: {
        file: "packages/render/src/surge-gauge.ts",
        symbol: "SEAM_LOOK",
        type: "SeamLook",
      },
      fields: { draw: paintGapingSeam },
    }),
  ],
};
