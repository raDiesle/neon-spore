import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawPopcap } from "./draw.js";

/**
 * POPCAP — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-tap`: PLUNGE and POPCAP. The shipped side is
 * the clover's wedges, cut from a silhouette no TAP body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_TAP_POPCAP: Variant = {
  slot: "blister:death-tap",
  name: "popcap",
  sentence:
    "The button pops off — the yellow press springs out of the body like a cap off a bottle, turning away to one side, and the body left with nothing in its middle sags back into its pore.",
  dir: "tools/versus/candidates/blister-death-tap/popcap",
  patches: [
    patch({
      target: death.BLISTER_DEATH.tap,
      reached: () => death.BLISTER_DEATH.tap,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.tap",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawPopcap } },
    }),
  ],
};
