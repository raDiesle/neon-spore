import * as band from "../../../../../packages/render/src/sinew-band.js";
import { patch, type Variant } from "../../../variant.js";
import { drawWhiteBand } from "./paint.js";

/**
 * WHITE — offered 7 October 2026, the owner's ask that day for THE SINEW's
 * unbuilt looks: *the strain band is white, the objective, half drawn on each
 * phone* (bosses-choreographed.md §8). The game draws a glass tube with a
 * green zone and a blue sum line, the owner's own by name on 2 and
 * 5 October 2026; this is the design's bar beside it, each seat keeping its
 * half — the zone on the pilot's, the sum on the navigator's.
 */
export const SINEW_WHITE: Variant = {
  slot: "sinew:band",
  name: "white",
  sentence:
    "white — the band one white bar: the zone a white block on the pilot's, the sum a white fill on the navigator's",
  dir: "tools/versus/candidates/sinew-band/white",
  patches: [
    patch({
      target: band.BAND_LOOK,
      reached: () => band.BAND_LOOK,
      where: {
        file: "packages/render/src/sinew-band.ts",
        symbol: "BAND_LOOK",
        type: "BandLook",
      },
      fields: { draw: drawWhiteBand },
    }),
  ],
};
