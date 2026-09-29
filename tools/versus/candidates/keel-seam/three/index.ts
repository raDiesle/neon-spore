import * as look from "../../../../../packages/render/src/keel-seam-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paint } from "./paint.js";

/**
 * THREE — offered 29 September 2026, from `bosses-choreographed.md` §24
 * *Animation*: a locked seam's brightness in three states across the fight.
 * The game draws one seam throughout, a thin white line as bright as its
 * segment. This is a hairline through movement one, a fuller seam pulsing on
 * the beat once the socket frees its segment, and full white through the
 * held breath and after — so how far the fight has come is on the seams.
 */
export const KEEL_THREE: Variant = {
  slot: "keel:seam",
  name: "three",
  sentence:
    "three — THE KEEL's seams are a hairline in movement one, a fuller pulsing seam from the socket on, and full white from the held breath, instead of one thin line all fight",
  dir: "tools/versus/candidates/keel-seam/three",
  patches: [
    patch({
      target: look.KEEL_SEAM,
      reached: () => look.KEEL_SEAM,
      where: {
        file: "packages/render/src/keel-seam-look.ts",
        symbol: "KEEL_SEAM",
        type: "{ paint: (ctx: CanvasRenderingContext2D, seam: Path2D, look: KeelSeamLook) => void }",
      },
      fields: { paint },
    }),
  ],
};
