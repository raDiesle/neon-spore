import * as death from "../../../../../packages/render/src/blister-death.js";
import { patch, type Variant } from "../../../variant.js";
import { drawSpill } from "./draw.js";

/**
 * SPILL — offered 17 October 2026, from the owner's ask the same day:
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
export const BLISTER_DEATH_HOLD_SPILL: Variant = {
  slot: "blister:death-hold",
  name: "spill",
  sentence:
    "Held until the drop bursts — it swells in the body's grip and breaks into a crown of green water that lands round the pore as splashes, while the body flinches and drops into its hole.",
  dir: "tools/versus/candidates/blister-death-hold/spill",
  patches: [
    patch({
      target: death.BLISTER_DEATH.hold,
      reached: () => death.BLISTER_DEATH.hold,
      where: {
        file: "packages/render/src/blister-death.ts",
        symbol: "BLISTER_DEATH.hold",
        type: "BlisterDeath",
      },
      fields: { play: { life: 0.95, draw: drawSpill } },
    }),
  ],
};
