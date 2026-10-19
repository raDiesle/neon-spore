import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintRim } from "./paint.js";

export const LOCK_LIGHT_RIM: Variant = {
  slot: "ship:lock-light",
  name: "rim",
  sentence:
    "a thin yellow ring round the egg in the cannon's mouth when the lock is ready — while it rests, a faint track with the yellow drawing round it from the top",
  dir: "tools/versus/candidates/ship-lock-light/rim",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintRim },
    }),
  ],
};
