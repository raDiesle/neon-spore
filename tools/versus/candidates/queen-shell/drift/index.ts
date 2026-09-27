import * as look from "../../../../../packages/render/src/outline-drift.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * DRIFT — offered 27 September 2026, from the queue's "Living bosses — every
 * other boss gets the outline drift". Her shell wobbles but never leaves level, so the whole of her leans a degree or two on her middle and back.
 *
 * The outline tier's pose (`docs/spec/living-bosses.md` §1): a lean, a squash
 * across the turn and a slide towards it, capped so no point of the body moves
 * more than a fifth of a tile — the hit tests read the rest pose.
 */
export const QUEEN_SHELL_DRIFT: Variant = {
  slot: "queen:shell",
  name: "drift",
  sentence:
    "drift — her shell, marks, arms and torches lean and sway a little as one body, out of step with every other boss, and hold still while a window asks",
  dir: "tools/versus/candidates/queen-shell/drift",
  patches: [
    patch({
      target: look.OUTLINE_DRIFT,
      reached: () => look.OUTLINE_DRIFT,
      where: {
        file: "packages/render/src/outline-drift.ts",
        symbol: "OUTLINE_DRIFT",
        type: "Record<OutlineBoss, number>",
      },
      fields: { queen: 1 },
    }),
  ],
};
