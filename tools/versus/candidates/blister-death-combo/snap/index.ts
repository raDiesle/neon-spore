import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSnap } from "./draw.js";

/**
 * SNAP — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-combo`: SNAP and SLIDE. The shipped side is
 * the clover's wedges, cut from a silhouette no COMBO body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_COMBO_SNAP: Variant = {
  slot: "blister:death-combo",
  name: "snap",
  sentence:
    "Press, then pull, then gone — pushed down once with a yellow ring, stretched out along the pull like taffy on a lit cord, until the cord snaps and the body flies off the way it was pulled.",
  dir: "tools/versus/candidates/blister-death-combo/snap",
  patches: [
    patch({
      target: death.BLISTER_DEATH.combo,
      reached: () => death.BLISTER_DEATH.combo,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.combo",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.0, draw: drawSnap } },
    }),
  ],
};
