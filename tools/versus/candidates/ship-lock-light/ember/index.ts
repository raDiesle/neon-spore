import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintEmber } from "./paint.js";

export const LOCK_LIGHT_EMBER: Variant = {
  slot: "ship:lock-light",
  name: "ember",
  sentence:
    "a thin yellow ring round the egg in the cannon's mouth when the lock is ready — and nothing at all while it rests, so the ring coming on is the news",
  dir: "tools/versus/candidates/ship-lock-light/ember",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintEmber },
    }),
  ],
};
