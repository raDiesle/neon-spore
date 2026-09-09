import * as join from "../../../../../packages/render/src/band-join.js";
import { patch, type Variant } from "../../../variant.js";
import { grown } from "../organs/paint.js";
import { ripple } from "../roof/paint.js";

/**
 * `panel:ship-join` / `both` — the roof is the hull's own ripple *and* every
 * button is grown out of it.
 *
 * The owner asked for the integration in both directions in one sentence:
 * *ship must more follow visual of control panel, or/and the way around*. ROOF
 * is the first half and ORGANS is the second, and this is the two together —
 * which is a third answer and not a summary of the other two, because the whole
 * question about them is whether they add up or fight.
 *
 * **They can add up.** A trunk leaving a roof that is the ship's own underside
 * leaves it at a *crest* or in a *trough*, and either reads as tissue following
 * the body it grew from. A pair looking at this should be able to watch one
 * shoulder ride up as the ripple passes under it.
 *
 * **They can also fight, and that is the reason this is a card of its own.**
 * Both halves put motion into the same strip: the roof boils at the hull's own
 * rate and the trunks sway at theirs, so the top of the panel is now two
 * animations crossing over eleven columns the pair reads by colour. If the
 * answer is that either alone is right and the two together are too much, that
 * is exactly what three cards are for and neither of the other two could have
 * shown it.
 *
 * **The paint is the other two candidates', imported rather than copied.** A
 * second spelling of a contour that has to line up with the ship's own crests
 * would be two roofs that agree until one of them is tuned — and this card's
 * whole claim is that it is precisely the other two at once, which a copy could
 * quietly stop being.
 */
export const JOIN_BOTH: Variant = {
  slot: "panel:ship-join",
  name: "both",
  sentence:
    "ROOF and ORGANS at once — the panel's ceiling is the hull's own ripple and every control is a trunk grown out of it, which is the only card that can say whether the two add up or fight",
  dir: "tools/versus/candidates/panel-join/both",
  patches: [
    patch({
      target: join.BAND_JOIN,
      reached: () => join.BAND_JOIN,
      where: {
        file: "packages/render/src/band-join.ts",
        symbol: "BAND_JOIN",
        type: "BandJoin",
      },
      fields: { ceiling: ripple, attach: grown },
    }),
  ],
};
