import { drawBakedMembrane } from "../../../../../packages/render/src/instar-wing-baked.js";
import * as wings from "../../../../../packages/render/src/instar-wings.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the fourth of the examples the owner
 * asked for of sprites drawn with more detail that do not blow up the bundle,
 * on THE INSTAR only. The wing membrane's detail — veins branching from every
 * bone and thinning, a hair of light on each, creases, and the skin glowing
 * through at the scallops — is painted once at load, flat, and laid on the
 * membrane in the wing's own frame in one draw, so it beats and turns with
 * it. `bun run sprite instar-wing` prints the costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;

export const INSTAR_WING_BAKED: Variant = {
  slot: "instar:wing",
  name: "baked",
  sentence:
    "baked — the wing skin carries veins branching from every bone and thinning as they go, each lit along one side, with creases toward the hem and the skin glowing through at the scallops, painted once at load and laid on the membrane in one draw",
  dir: "tools/versus/candidates/instar-wing/baked",
  patches: [
    patch({
      target: wings.WING_LOOK,
      reached: () => wings.WING_LOOK,
      where: {
        file: "packages/render/src/instar-wings.ts",
        symbol: "WING_LOOK",
        type: "{ paint }",
      },
      fields: {
        paint: (ctx, skin) => drawBakedMembrane(ctx, skin, dpr()),
      },
    }),
  ],
};
