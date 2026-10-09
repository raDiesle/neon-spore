import * as glance from "../../../../../packages/render/src/instar-glance.js";
import { patch, type Variant } from "../../../variant.js";
import { stationsLean } from "./paint.js";

/**
 * STATIONS — offered 9 October 2026, the owner: *the tail could switch
 * to move from right to middle and left, so it does not stay at the same
 * position all the time*. One of two answers in `instar:tail`: STATIONS and
 * PENDULUM.
 */
export const INSTAR_STATIONS: Variant = {
  slot: "instar:tail",
  name: "stations",
  sentence:
    "stations — THE INSTAR's resting tail moves from the right to the middle to the left and back, holding each place a while before it swings on",
  dir: "tools/versus/candidates/instar-tail/stations",
  patches: [
    patch({
      target: glance.INSTAR_TAIL_REST,
      reached: () => glance.INSTAR_TAIL_REST,
      where: {
        file: "packages/render/src/instar-glance.ts",
        symbol: "INSTAR_TAIL_REST",
        type: "TailRest",
      },
      fields: { lean: stationsLean },
    }),
  ],
};
