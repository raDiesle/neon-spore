import * as bodyHit from "../../../../../packages/render/src/body-hit.js";
import { patch, type Variant } from "../../../variant.js";
import { scatter } from "./paint.js";

/**
 * `bulb:hit` / `scatter` — the spores are set loose.
 *
 * **What the shipped side is.** Five squares of cyan and nine wedges of
 * skin; a spore case that never once lets a spore out.
 *
 * **What this argues.** The case fails and its contents get out: from the
 * eleven places the interior packs them, lit balls of the body's cyan fly
 * outward, the deep ones slow and dim and the near ones fast and bright,
 * each trailing its own light and drifting *up* as it slows. They blink out
 * one by one, the last well above where the bulb was. Nothing lands on the
 * ship — spores rise — which no other kill in the game does.
 *
 * **How it can lose.** *Eleven lit balls are eleven bodies.* They are
 * small, they leave fast and they go up out of the lane; if at 26 px the
 * lane still reads as occupied, this loses.
 */
export const BULB_HIT_SCATTER: Variant = {
  slot: "bulb:hit",
  name: "scatter",
  sentence:
    "the case fails and the eleven spores get out — lit balls of the body's cyan leaving from where each sat, the deep ones slow and dim, every one trailing its light and drifting up as it slows, blinking out one by one; nothing lands on the ship",
  dir: "tools/versus/candidates/bulb-hit/scatter",
  patches: [
    patch({
      target: bodyHit.BULB_HIT,
      // The route the effects take: `body-strike.ts` and `effects-break.ts`
      // both ask `hitFor` for the record, per kind, every kill.
      reached: () => bodyHit.hitFor("bulb"),
      where: {
        file: "packages/render/src/body-hit.ts",
        symbol: "BULB_HIT",
        type: "HitLook",
      },
      fields: { life: 0.9, strike: scatter },
    }),
  ],
};
