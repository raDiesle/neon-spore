import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintHalo } from "./paint.js";

export const LOCK_LIGHT_HALO: Variant = {
  slot: "ship:lock-light",
  name: "halo",
  sentence:
    "the cannon's whole mouth ringed — a grey track with amber sweeping round it while the lock rests, a thick amber ring breathing on the beat when it is ready",
  dir: "tools/versus/candidates/ship-lock-light/halo",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintHalo },
    }),
  ],
};
