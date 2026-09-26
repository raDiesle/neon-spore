import * as moult from "../../../../../packages/render/src/instar-moult.js";
import { drawBakedPale } from "../../../../../packages/render/src/instar-moult-baked.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the fifth of the examples the owner
 * asked for of sprites drawn with more detail that do not blow up the bundle,
 * on THE INSTAR only. The new body in the moult's split keeps its two fills
 * and gains a tile painted once at load (`render/sprite-bake.ts`) — soft folds
 * running along the back, their creases dark and crowns lit, wrinkles across
 * them and beads of wet — laid over the split in one pattern fill that turns
 * with the back. `bun run sprite instar-moult` prints the costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;
const shipped = moult.PALE_LOOK.paint;

export const INSTAR_MOULT_BAKED: Variant = {
  slot: "instar:moult",
  name: "baked",
  sentence:
    "baked — the new body in the split is folded and wet: soft folds along the back with lit crowns, wrinkles across them and beads of wet, painted once at load and laid over the split in one fill",
  dir: "tools/versus/candidates/instar-moult/baked",
  patches: [
    patch({
      target: moult.PALE_LOOK,
      reached: () => moult.PALE_LOOK,
      where: {
        file: "packages/render/src/instar-moult.ts",
        symbol: "PALE_LOOK",
        type: "{ paint }",
      },
      fields: {
        paint: (ctx, skin) => drawBakedPale(ctx, skin, shipped, dpr()),
      },
    }),
  ],
};
