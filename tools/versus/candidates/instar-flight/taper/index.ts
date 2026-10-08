import * as look from "../../../../../packages/render/src/instar-flight-look.js";
import { patch, type Variant } from "../../../variant.js";
import { flyTaperedBody, flyTaperedFigure } from "./paint.js";

/**
 * TAPER — offered 8 October 2026, option (B) of the owner's (C): THE INSTAR
 * flies in face-on as it ships, but the seamed tube behind the head is one
 * smooth taper seen a third of the way round, with the legs hanging off it
 * and the wings spread full. Beside it in the slot, SIDE flies in profile.
 */
export const INSTAR_TAPER: Variant = {
  slot: "instar:flight",
  name: "taper",
  sentence:
    "taper — the dragon flies in facing the ship, a smooth tapered body going away behind its head, legs hanging and wings spread full",
  dir: "tools/versus/candidates/instar-flight/taper",
  patches: [
    patch({
      target: look.INSTAR_FLIGHT_LOOK,
      reached: () => look.INSTAR_FLIGHT_LOOK,
      where: {
        file: "packages/render/src/instar-flight-look.ts",
        symbol: "INSTAR_FLIGHT_LOOK",
        type: "FlightLook",
      },
      fields: { figure: flyTaperedFigure, body: flyTaperedBody },
    }),
  ],
};
