import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawDrain } from "./draw.js";

/**
 * DRAIN — offered 17 October 2026, from the owner's ask the same day:
 * *every "controls" brush has a weird destroy animation, which looks like a
 * "bulb" is destroyed … create individual new destroy animation visuals,
 * ideally which fit the control or graphic behind each.* One of
 * 2 answers in `blister:death-hold`: DRAIN and SPILL. The shipped side is
 * the clover's wedges, cut from a silhouette no HOLD body wears.
 *
 * How it can lose: if it is not seen at tempo — the blow and the green ring
 * land on the same frame, and a death that is over before the eye leaves the
 * ring reads as the body vanishing.
 */
export const BLISTER_DEATH_HOLD_DRAIN: Variant = {
  slot: "blister:death-hold",
  name: "drain",
  sentence:
    "Held until it ran dry — the green drop shrinks to nothing as a thread of water runs out of it into the pore, and the emptied body wilts over and slides down after it.",
  dir: "tools/versus/candidates/blister-death-hold/drain",
  patches: [
    patch({
      target: death.BLISTER_DEATH.hold,
      reached: () => death.BLISTER_DEATH.hold,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.hold",
        type: "BlisterDeath",
      },
      fields: { play: { life: 1.1, draw: drawDrain } },
    }),
  ],
};
