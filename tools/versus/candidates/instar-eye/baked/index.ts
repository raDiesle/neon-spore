import { drawBakedIris } from "../../../../../packages/render/src/instar-eye-baked.js";
import * as head from "../../../../../packages/render/src/instar-head-parts.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the seventh of the examples the owner
 * asked for of sprites drawn with more detail that do not blow up the bundle,
 * on THE INSTAR only. The iris of each front eye — the eyes the glare turns
 * on the players — is painted once at load (`render/sprite-bake.ts`): fibres
 * out from the slit, a ragged ring where its two colours meet, a dark limbal
 * ring, flecks of ember and a wet crescent of light, squashed as the lid
 * narrows. The slit, rim and glint stay live over it. `bun run sprite
 * instar-eye` prints the costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;
const shipped = head.IRIS_LOOK.paint;

export const INSTAR_EYE_BAKED: Variant = {
  slot: "instar:eye",
  name: "baked",
  sentence:
    "baked — the front eyes' irises are painted once at load: fibres out from the slit, a dark ring at the edge, ember flecks and a wet crescent of light, squashed as the lid narrows, the slit still live over it",
  dir: "tools/versus/candidates/instar-eye/baked",
  patches: [
    patch({
      target: head.IRIS_LOOK,
      reached: () => head.IRIS_LOOK,
      where: {
        file: "packages/render/src/instar-head-parts.ts",
        symbol: "IRIS_LOOK",
        type: "{ paint }",
      },
      fields: {
        paint: (ctx, iris) => drawBakedIris(ctx, iris, shipped, dpr()),
      },
    }),
  ],
};
