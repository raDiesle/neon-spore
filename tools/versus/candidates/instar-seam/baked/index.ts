import * as profile from "../../../../../packages/render/src/instar-profile.js";
import { drawBakedSeam } from "../../../../../packages/render/src/instar-seam-baked.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * BAKED — offered 26 September 2026, the sixth of the examples the owner asked
 * for of sprites drawn with more detail that do not blow up the bundle, on THE
 * INSTAR only. Each ring of the long body side-on, where two segments meet, is
 * a joint in armour painted once at load (`render/sprite-bake.ts`) — a dark
 * groove, the rear segment's lip standing proud of it with its crown lit, a
 * row of knobs along it, fading toward the belly — instead of one glowing
 * line. `bun run sprite instar-seam` prints the costs.
 */
const dpr = (): number => (globalThis as { devicePixelRatio?: number }).devicePixelRatio ?? 1;

export const INSTAR_SEAM_BAKED: Variant = {
  slot: "instar:seam",
  name: "baked",
  sentence:
    "baked — each ring of the long body is a joint in armour: a dark groove, the rear segment's lip lit along its crown with knobs on it, fading into the belly, painted once at load and drawn in one image",
  dir: "tools/versus/candidates/instar-seam/baked",
  patches: [
    patch({
      target: profile.RING_LOOK,
      reached: () => profile.RING_LOOK,
      where: {
        file: "packages/render/src/instar-profile.ts",
        symbol: "RING_LOOK",
        type: "{ paint }",
      },
      fields: {
        paint: (ctx, ring) => drawBakedSeam(ctx, ring, dpr()),
      },
    }),
  ],
};
