import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintFade } from "./paint.js";

export const LOCK_LIGHT_FADE: Variant = {
  slot: "ship:lock-light",
  name: "fade",
  sentence:
    "the yellow ring round the egg is always there — almost gone the moment a lock is spent, warming through the rest, full when it is ready",
  dir: "tools/versus/candidates/ship-lock-light/fade",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintFade },
    }),
  ],
};
