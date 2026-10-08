import * as shape from "../../../../../packages/render/src/ledger-shape.js";
import { patch, type Variant } from "../../../variant.js";
import { platedBack } from "./back.js";

/**
 * PLATED — offered 8 October 2026, the second of THE LEDGER's two unbuilt
 * looks the owner asked for in VERSUS once he kept the boss: the design's
 * lobed back off the shape sheet (bosses.md §11.27). The game draws each half
 * through its own seven points, three soft swells; this is COLONY · PLATED,
 * two free drafts combined — CODE PLATE's squared slab with COLONY's five
 * bodies swelling down its back (`back.ts`).
 */
export const LEDGER_PLATED: Variant = {
  slot: "ledger:back",
  name: "plated",
  sentence:
    "plated — each half a squared plate cut down the seam, with five small lobes swelling down its back and breathing out of step",
  dir: "tools/versus/candidates/ledger-back/plated",
  patches: [
    patch({
      target: shape.LEDGER_BACK,
      reached: () => shape.LEDGER_BACK,
      where: {
        file: "packages/render/src/ledger-shape.ts",
        symbol: "LEDGER_BACK",
        type: "LedgerBack",
      },
      fields: { points: platedBack },
    }),
  ],
};
