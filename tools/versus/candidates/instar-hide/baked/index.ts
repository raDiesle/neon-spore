import * as hide from "../../../../../packages/render/src/instar-hide.js";
import { drawBakedScales } from "../../../../../packages/render/src/instar-hide-baked.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the third of the examples the owner
 * asked for of sprites drawn with more detail that do not blow up the bundle,
 * on THE INSTAR only. A tile of scales is painted once at load
 * (`render/sprite-bake.ts`) — each scale lit, keeled, pitted and lapping the
 * one below — and laid over a plate as a pattern in one fill, where the
 * shipped hide strokes a row of arcs at a time. `bun run sprite instar-hide`
 * prints the costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;

export const INSTAR_HIDE_BAKED: Variant = {
  slot: "instar:hide",
  name: "baked",
  sentence:
    "baked — the hide is a tile of lit scales, each with a keel, a pit or two and a shadow where it laps the next, painted once at load and laid over every plate in one fill",
  dir: "tools/versus/candidates/instar-hide/baked",
  patches: [
    patch({
      target: hide.HIDE_LOOK,
      reached: () => hide.HIDE_LOOK,
      where: {
        file: "packages/render/src/instar-hide.ts",
        symbol: "HIDE_LOOK",
        type: "{ paint }",
      },
      fields: {
        paint: (ctx, p, form, size, fade) => drawBakedScales(ctx, p, form, size, fade, dpr()),
      },
    }),
  ],
};
