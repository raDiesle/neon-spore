import * as bodyHit from "../../../../../packages/render/src/body-hit.js";
import { patch, type Variant } from "../../../variant.js";
import { shock } from "./paint.js";

/**
 * `bulb:hit` / `shock` — the body takes the hit before it goes.
 *
 * **What the shipped side is.** Five squares and nine wedges, from the
 * first frame: a body that is gone before it is seen to be struck.
 *
 * **What this argues.** A tenth of a second of impact first: the contour
 * pressed flat against the blow from below, its base held and its top
 * driven down, then rebounding past its own shape and letting go on the
 * rebound. Out of the point of impact two rings of the body's cyan run down
 * the column to the ship, held to the lane's width, the body a haze blown
 * out behind them. Where the first ring reaches the ship, the hull under
 * the column is lit for the rest of the strike.
 *
 * **How it can lose.** *A squash is a body still there.* That tenth is the
 * point — nothing else in the game shows a hit as a blow rather than a
 * burst — and if at 26 px it reads as the bulb dodging or shrinking rather
 * than being struck, this loses.
 */
export const BULB_HIT_SHOCK: Variant = {
  slot: "bulb:hit",
  name: "shock",
  sentence:
    "the contour is pressed flat against the blow from below and rebounds past its own shape, then two rings of the body's cyan leave the point of impact and run down the column to the ship, held to the lane's width, the body a haze behind them — where the first ring reaches the ship the hull is lit",
  dir: "tools/versus/candidates/bulb-hit/shock",
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
      fields: { life: 0.9, strike: shock },
    }),
  ],
};
