import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintBreath } from "./paint.js";

export const LOCK_LIGHT_BREATH: Variant = {
  slot: "ship:lock-light",
  name: "breath",
  sentence:
    "nothing while the lock rests — ready, a thin yellow ring round the egg with a soft glow under it that breathes once a beat",
  dir: "tools/versus/candidates/ship-lock-light/breath",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintBreath },
    }),
  ],
};
