import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSmear } from "./draw.js";

/**
 * SMEAR — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-swipe`: SMEAR and UNZIP. The shipped side is
 * the clover's wedges, cut from a silhouette no SWIPE body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_SWIPE_SMEAR: Variant = {
  slot: "blister:death-swipe",
  name: "smear",
  sentence:
    "Wiped away the way it was stroked — the body is dragged out along its channel, stretched long and thin, trailing fainter copies of itself and three speed lines.",
  dir: "tools/versus/candidates/blister-death-swipe/smear",
  patches: [
    patch({
      target: death.BLISTER_DEATH.swipe,
      reached: () => death.BLISTER_DEATH.swipe,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.swipe",
        type: "BlisterDeath",
      },
      fields: { play: { life: 0.8, draw: drawSmear } },
    }),
  ],
};
