import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintTicks } from "./paint.js";

export const LOCK_LIGHT_TICKS: Variant = {
  slot: "ship:lock-light",
  name: "ticks",
  sentence:
    "four short yellow marks on the ring round the egg — one lit for each second of the rest, closing into the whole ring when it is ready",
  dir: "tools/versus/candidates/ship-lock-light/ticks",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintTicks },
    }),
  ],
};
