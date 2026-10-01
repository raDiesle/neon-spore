import * as outline from "../../../../../packages/render/src/outline-drift.js";
import * as surface from "../../../../../packages/render/src/reprise-surface.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * TURN — offered 1 October 2026, from `docs/spec/living-bosses.md` §1 and the
 * owner's answer that day to the queue's "surface marks by longitude": THE
 * REPRISE's sac turns first. The sac leans on the outline drift as
 * `reprise:sac` once did, and this time its skin turns with it: the veins on
 * its lobes are pinned by longitude (`reprise-surface.ts`), so they slide
 * across it up to 40° — fast through the middle, crawling at the rim — the
 * near ones go over the edge and a far pair comes round from behind. The
 * gloss stays where the light puts it.
 */
export const REPRISE_SKIN_TURN: Variant = {
  slot: "reprise:skin",
  name: "turn",
  sentence:
    "turn — THE REPRISE's sac turns slowly left and right, its veins sliding round it, the near ones going over the edge and a far pair coming round from behind",
  dir: "tools/versus/candidates/reprise-skin/turn",
  patches: [
    patch({
      target: surface.REPRISE_SURFACE,
      reached: () => surface.REPRISE_SURFACE,
      where: {
        file: "packages/render/src/reprise-surface.ts",
        symbol: "REPRISE_SURFACE",
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
      fields: { reprise: 1 },
    }),
  ],
};
