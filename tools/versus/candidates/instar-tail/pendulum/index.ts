import * as glance from "../../../../../packages/render/src/instar-glance.js";
import { patch, type Variant } from "../../../variant.js";
import { pendulumLean } from "./paint.js";

/**
 * PENDULUM — offered 9 October 2026, the owner: *the tail could switch
 * to move from right to middle and left, so it does not stay at the same
 * position all the time*. One of two answers in `instar:tail`: STATIONS and
 * PENDULUM.
 */
export const INSTAR_PENDULUM: Variant = {
  slot: "instar:tail",
  name: "pendulum",
  sentence:
    "pendulum — THE INSTAR's resting tail sweeps slowly from the right over the middle to the left and back, never stopping",
  dir: "tools/versus/candidates/instar-tail/pendulum",
  patches: [
    patch({
      target: glance.INSTAR_TAIL_REST,
      reached: () => glance.INSTAR_TAIL_REST,
      where: {
        file: "packages/render/src/instar-glance.ts",
        symbol: "INSTAR_TAIL_REST",
        type: "TailRest",
      },
      fields: { lean: pendulumLean },
    }),
  ],
};
