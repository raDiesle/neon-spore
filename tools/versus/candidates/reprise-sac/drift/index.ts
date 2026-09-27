import * as look from "../../../../../packages/render/src/outline-drift.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 27 September 2026, from the queue's "Living bosses — every
 * other boss gets the outline drift". The sac hangs dead still through its tear, so it sways a little where it hangs, and the tear stays put.
 *
 * The outline tier's pose (`docs/spec/living-bosses.md` §1): a lean, a squash
 * across the turn and a slide towards it, capped so no point of the body moves
 * more than a fifth of a tile — the hit tests read the rest pose.
 */
export const REPRISE_SAC_DRIFT: Variant = {
  slot: "reprise:sac",
  name: "drift",
  sentence:
    "drift — the sac leans and sways a little where it hangs through the tear, lens and eggs with it; the tear, the field's own edge, stays put",
  dir: "tools/versus/candidates/reprise-sac/drift",
  patches: [
    patch({
      target: look.OUTLINE_DRIFT,
      reached: () => look.OUTLINE_DRIFT,
      where: {
        file: "packages/render/src/outline-drift.ts",
        symbol: "OUTLINE_DRIFT",
        type: "Record<OutlineBoss, number>",
      },
      fields: { reprise: 1 },
    }),
  ],
};
