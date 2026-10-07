import * as sway from "../../../../../packages/render/src/sinew-sway.js";
import { patch, type Variant } from "../../../variant.js";
import { carryHeavy } from "./spring.js";

/**
 * HEAVY — offered 7 October 2026, the owner's ask that day for THE SINEW's
 * unbuilt looks: *the mass swinging with real lag and overshoot*
 * (bosses-choreographed.md §8). The game draws the mass exactly where the sum
 * hangs it; this one trails it on a slow, lightly damped spring, so a snap
 * throws it up past its rest and it rings back down. Judged in motion.
 */
export const SINEW_HEAVY: Variant = {
  slot: "sinew:weight",
  name: "heavy",
  sentence:
    "heavy — the mass trails where the pull hangs it and overshoots, so a snap throws it up past its rest and it rings back down",
  dir: "tools/versus/candidates/sinew-weight/heavy",
  patches: [
    patch({
      target: sway.SINEW_WEIGHT,
      reached: () => sway.SINEW_WEIGHT,
      where: {
        file: "packages/render/src/sinew-sway.ts",
        symbol: "SINEW_WEIGHT",
        type: "SinewWeight",
      },
      fields: { carry: carryHeavy },
    }),
  ],
};
