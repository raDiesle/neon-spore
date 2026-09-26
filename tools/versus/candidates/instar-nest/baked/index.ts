import * as eggs from "../../../../../packages/render/src/instar-eggs.js";
import { drawBakedNests } from "../../../../../packages/render/src/instar-nest-baked.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, when the owner asked for examples of
 * sprites drawn with more detail that do not blow up the bundle, on THE
 * INSTAR only. The nests and their eggs are painted once at load into a
 * canvas (`render/sprite-bake.ts`) and blitted each frame: more strands, dew
 * and speckle than a frame could draw, in fewer canvas calls than the
 * shipped ones. `bun run sprite` prints the costs.
 */
export const INSTAR_NEST_BAKED: Variant = {
  slot: "instar:nest",
  name: "baked",
  sentence:
    "baked — the nests are cocoons of a hundred and sixty wound strands with dew caught on them, and each egg a speckled shell with a stirring grub inside, painted once at load and blitted every frame",
  dir: "tools/versus/candidates/instar-nest/baked",
  patches: [
    patch({
      target: eggs.NEST_LOOK,
      reached: () => eggs.NEST_LOOK,
      where: {
        file: "packages/render/src/instar-eggs.ts",
        symbol: "NEST_LOOK",
        type: "{ paint }",
      },
      fields: { paint: drawBakedNests },
    }),
  ],
};
