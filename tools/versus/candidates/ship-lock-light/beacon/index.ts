import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintBeacon } from "./paint.js";

export const LOCK_LIGHT_BEACON: Variant = {
  slot: "ship:lock-light",
  name: "beacon",
  sentence:
    "a beacon on a stalk out of the cannon's shoulder — grey and growing while the lock rests, standing tall and burning amber when it is ready",
  dir: "tools/versus/candidates/ship-lock-light/beacon",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintBeacon },
    }),
  ],
};
