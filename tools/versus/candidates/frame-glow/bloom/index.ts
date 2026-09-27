import * as post from "../../../../../packages/render/src/frame-post.js";
import { patch, type Variant } from "../../../variant.js";
import { bloomAfter } from "./bloom-gl.js";

/**
 * **A GPU bloom over the whole frame**, against the glow the game draws
 * today — layered strokes and baked additive halos on the 2D canvas
 * (`packages/render/src/glow.ts`), and nothing after them. The owner asked,
 * 26 September 2026, for a GPU glow to be tried if it is best practice, and
 * said battery and frame time matter to him: so this is the look, and the
 * cost is a measurement on a real phone that no lane can take
 * (`docs/performance.md`, "The WebGL bloom candidate").
 *
 * The pass is `bloom-gl.ts`; this file is only the one field it patches.
 */
export const FRAME_BLOOM: Variant = {
  slot: "frame:glow",
  name: "bloom",
  sentence:
    "the bright part of the finished frame, blurred at a quarter size in WebGL and laid back over it — every lamp, rim and beam bleeds light past its own edge",
  dir: "tools/versus/candidates/frame-glow/bloom",
  patches: [
    patch({
      target: post.FRAME_POST,
      // `Canvas2DRenderer.draw` reads the export itself; the namespace is the route.
      reached: () => post.FRAME_POST,
      where: {
        file: "packages/render/src/frame-post.ts",
        symbol: "FRAME_POST",
        type: "FramePost",
      },
      fields: { after: bloomAfter },
    }),
  ],
};
