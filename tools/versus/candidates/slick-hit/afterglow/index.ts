import * as bodyHit from "../../../../../packages/render/src/body-hit.js";
import { patch, type Variant } from "../../../variant.js";
import { afterglow } from "./paint.js";

/**
 * `slick:hit` / `afterglow` — the nucleus is the last thing to go.
 *
 * **What the shipped side is.** Five squares and nine wedges: material, and
 * nothing of the light the slick's interior was sending along its veins.
 *
 * **What this argues.** The skin goes at once and the two cores stay: each
 * swells and burns from the body's red toward white for a third of a
 * second, then collapses to a point and lets go of a ring of light that runs
 * out and thins to nothing. Over all of it the outline hangs as an
 * afterimage, stroked once and fading. It leaves nothing on the ship — only
 * the shape of where it was.
 *
 * **How it can lose.** *A swelling core is a body still there.* The cores
 * are additive light and the afterimage is an empty stroke, which is what
 * says *gone*; if at 26 px the lane reads as occupied for that third of a
 * second, this loses.
 */
export const SLICK_HIT_AFTERGLOW: Variant = {
  slot: "slick:hit",
  name: "afterglow",
  sentence:
    "the skin goes at once and the two cores stay — each swelling and burning from red toward white, then collapsing to a point that lets go of a ring of light — while the outline hangs as a fading afterimage; nothing lands on the ship",
  dir: "tools/versus/candidates/slick-hit/afterglow",
  patches: [
    patch({
      target: bodyHit.SLICK_HIT,
      // The route the effects take: `body-strike.ts` and `effects-break.ts`
      // both ask `hitFor` for the record, per kind, every kill.
      reached: () => bodyHit.hitFor("slick"),
      where: {
        file: "packages/render/src/body-hit.ts",
        symbol: "SLICK_HIT",
        type: "HitLook",
      },
      fields: { life: 0.9, strike: afterglow },
    }),
  ],
};
