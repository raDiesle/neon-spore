import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawPlunge } from "./draw.js";

/**
 * PLUNGE — offered 17 October 2026, from the owner's ask the same day:
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
export const BLISTER_DEATH_TAP_PLUNGE: Variant = {
  slot: "blister:death-tap",
  name: "plunge",
  sentence:
    "Pressed all the way through — the blow bottoms the body out flat on its pore with a yellow click off the lip, and the flattened body is pushed on down into the hole.",
  dir: "tools/versus/candidates/blister-death-tap/plunge",
  patches: [
    patch({
      target: death.BLISTER_DEATH.tap,
      reached: () => death.BLISTER_DEATH.tap,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.tap",
        type: "BlisterDeath",
      },
      fields: { play: { life: 0.85, draw: drawPlunge } },
    }),
  ],
};
