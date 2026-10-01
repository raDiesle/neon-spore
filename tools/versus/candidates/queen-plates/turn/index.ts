import * as outline from "../../../../../packages/render/src/outline-drift.js";
import * as surface from "../../../../../packages/render/src/queen-surface.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * TURN — offered 1 October 2026, from `docs/spec/living-bosses.md` §1 and the
 * owner's answer that day to the queue's "surface marks by longitude": after
 * THE REPRISE's sac, THE QUEEN's shell. She leans on the outline drift as
 * `queen:shell` once did, and this time her plates turn with her: the seams
 * between them are pinned by longitude (`queen-surface.ts`), so they slide
 * across her up to 45° — fast through the middle, crawling at the wing tips —
 * an outer seam goes over the rim and a far one comes round from behind. The
 * two marks under her ride the same turn by 9°, a third of a tile, and the
 * thumb finds them where they are drawn.
 */
export const QUEEN_PLATES_TURN: Variant = {
  slot: "queen:plates",
  name: "turn",
  sentence:
    "turn — THE QUEEN's shell turns slowly left and right, its plates sliding round her, an outer seam going over the rim and a far one coming round, her two marks riding the turn a little",
  dir: "tools/versus/candidates/queen-plates/turn",
  patches: [
    patch({
      target: surface.QUEEN_SURFACE,
      reached: () => surface.QUEEN_SURFACE,
      where: {
        file: "packages/render/src/queen-surface.ts",
        symbol: "QUEEN_SURFACE",
        type: "{ amount: number; degrees: number }",
      },
      fields: { amount: 1 },
    }),
    patch({
      target: outline.OUTLINE_DRIFT,
      reached: () => outline.OUTLINE_DRIFT,
      where: {
        file: "packages/render/src/outline-drift.ts",
        symbol: "OUTLINE_DRIFT",
        type: "Record<OutlineBoss, number>",
      },
      fields: { queen: 1 },
    }),
  ],
};
