import * as look from "../../../../../packages/render/src/outline-drift.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 27 September 2026, from the queue's "Living bosses — every
 * other boss gets the outline drift". The pile stands dead upright, each stone settling on its own, so the whole of it leans a little on its foot.
 *
 * The outline tier's pose (`docs/spec/living-bosses.md` §1): a lean, a squash
 * across the turn and a slide towards it, capped so no point of the body moves
 * more than a fifth of a tile — the hit tests read the rest pose.
 */
export const CAIRN_PILE_DRIFT: Variant = {
  slot: "cairn:pile",
  name: "drift",
  sentence:
    "drift — the pile leans a little on its foot as one body, the hand and the lane mark with it, on top of each stone's own settle",
  dir: "tools/versus/candidates/cairn-pile/drift",
  patches: [
    patch({
      target: look.OUTLINE_DRIFT,
      reached: () => look.OUTLINE_DRIFT,
      where: {
        file: "packages/render/src/outline-drift.ts",
        symbol: "OUTLINE_DRIFT",
        type: "Record<OutlineBoss, number>",
      },
      fields: { cairn: 1 },
    }),
  ],
};
