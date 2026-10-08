import * as look from "../../../../../packages/render/src/instar-flight-look.js";
import { patch, type Variant } from "../../../variant.js";
import { flySideOn } from "./paint.js";

/**
 * SIDE — offered 8 October 2026, option (A) of the owner's (C): THE INSTAR
 * flies in side-on, so the turned head, the legs and the raised wings grow
 * in from far away, and it turns face-on only as it arrives; the body keeps
 * its plates. Beside it in the slot, TAPER keeps the face-on approach.
 */
export const INSTAR_SIDE: Variant = {
  slot: "instar:flight",
  name: "side",
  sentence:
    "side — the dragon flies in from far off in profile, head turned, legs under it and wings up, and turns to face the ship only as it arrives",
  dir: "tools/versus/candidates/instar-flight/side",
  patches: [
    patch({
      target: look.INSTAR_FLIGHT_LOOK,
      reached: () => look.INSTAR_FLIGHT_LOOK,
      where: {
        file: "packages/render/src/instar-flight-look.ts",
        symbol: "INSTAR_FLIGHT_LOOK",
        type: "FlightLook",
      },
      fields: { figure: flySideOn, body: () => 0 },
    }),
  ],
};
