import * as heart from "../../../../../packages/render/src/instar-heart.js";
import { drawBakedHeart } from "../../../../../packages/render/src/instar-heart-baked.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the tenth of the examples the owner
 * asked for of sprites drawn with more detail that do not blow up the bundle,
 * on THE INSTAR only. The heart lit in the bare body's split is painted once
 * at load (`render/sprite-bake.ts`): two lobes shaded round, a crease, veins,
 * a wet highlight and a rim of light, the glow behind it, swelling with the
 * thump by the size it is drawn at. `bun run sprite instar-heart` prints the
 * costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;
const shipped = heart.HEART_LOOK.paint;

export const INSTAR_HEART_BAKED: Variant = {
  slot: "instar:heart",
  name: "baked",
  sentence:
    "baked — the heart in the split is an organ painted once at load: two lobes shaded round, a crease and veins, a wet highlight and a rim of light, swelling on the beat",
  dir: "tools/versus/candidates/instar-heart/baked",
  patches: [
    patch({
      target: heart.HEART_LOOK,
      reached: () => heart.HEART_LOOK,
      where: {
        file: "packages/render/src/instar-heart.ts",
        symbol: "HEART_LOOK",
        type: "{ paint }",
      },
      fields: {
        paint: (ctx, beat) => drawBakedHeart(ctx, beat, shipped, dpr()),
      },
    }),
  ],
};
