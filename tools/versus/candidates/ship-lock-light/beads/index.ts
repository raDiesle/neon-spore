import * as look from "../../../../../packages/render/src/lock-light-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paintBeads } from "./paint.js";

export const LOCK_LIGHT_BEADS: Variant = {
  slot: "ship:lock-light",
  name: "beads",
  sentence:
    "four beads along the hull beside the cannon — one lit for each second of the rest; all four lit and flashing on the beat is a lock ready",
  dir: "tools/versus/candidates/ship-lock-light/beads",
  patches: [
    patch({
      target: look.LOCK_LIGHT,
      reached: () => look.LOCK_LIGHT,
      where: {
        file: "packages/render/src/lock-light-look.ts",
        symbol: "LOCK_LIGHT",
        type: "LockLightLook",
      },
      fields: { paint: paintBeads },
    }),
  ],
};
