import * as spit from "../../../../../packages/render/src/instar-spit.js";
import {
  drawBakedGlob,
  drawBakedSpark,
} from "../../../../../packages/render/src/instar-spit-baked.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the eighth and ninth of the examples the
 * owner asked for of sprites drawn with more detail that do not blow up the
 * bundle, on THE INSTAR only. The second act's fire is painted once at load
 * (`render/sprite-bake.ts`): each glob a ball of flame in four churning
 * frames, its tongues licking off the edge and its trail the same painting
 * fading behind it; each ember a halo, a hot core and a glint in one draw.
 * `bun run sprite instar-glob` and `bun run sprite instar-spark` print the costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;
const shipped = { ...spit.SPIT_LOOK };

export const INSTAR_SPIT_BAKED: Variant = {
  slot: "instar:spit",
  name: "baked",
  sentence:
    "baked — the globs of fire are balls of flame painted once at load, tongues licking off them and churning through four frames, the trail the same flame fading; the embers are sparks with a hot core and a glint",
  dir: "tools/versus/candidates/instar-spit/baked",
  patches: [
    patch({
      target: spit.SPIT_LOOK,
      reached: () => spit.SPIT_LOOK,
      where: {
        file: "packages/render/src/instar-spit.ts",
        symbol: "SPIT_LOOK",
        type: "{ glob, spark }",
      },
      fields: {
        glob: (ctx, ball) => drawBakedGlob(ctx, ball, shipped.glob, dpr()),
        spark: (ctx, spark) => drawBakedSpark(ctx, spark, shipped.spark, dpr()),
      },
    }),
  ],
};
