import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawLeverSnap } from "./draw.js";

/**
 * SNAP — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-lever`: YANK and SNAP. The shipped side is
 * the clover's wedges, cut from a silhouette no LEVER body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_LEVER_SNAP: Variant = {
  slot: "blister:death-lever",
  name: "snap",
  sentence:
    "The lever breaks — its cord snaps at the pore with a jagged yellow crack, and the body that was held down springs up off the tile, tumbling, then falls back into its hole.",
  dir: "tools/versus/candidates/blister-death-lever/snap",
  patches: [
    patch({
      target: death.BLISTER_DEATH.lever,
      reached: () => death.BLISTER_DEATH.lever,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.lever",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawLeverSnap } },
    }),
  ],
};
