import * as glow from "../../../../../packages/render/src/glow.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * Every body's glow at the reach it was written for: the spread counted on
 * the screen rather than in the body's own units, so a living body, a pod,
 * the wreck and THE GHOST all wear a 5 px halo where today they wear about
 * one and a half (`glow.ts`, `BODY_GLOW`).
 */
export const BODY_FULL: Variant = {
  slot: "body:glow",
  name: "full",
  sentence:
    "every body's neon edge at the full reach it was written for — about three times as wide as the thin one it wears today",
  dir: "tools/versus/candidates/body-glow/full",
  patches: [
    patch({
      target: glow.BODY_GLOW,
      reached: () => glow.BODY_GLOW,
      where: {
        file: "packages/render/src/glow.ts",
        symbol: "BODY_GLOW",
        type: "BodyGlow",
      },
      fields: { onScreen: 1 },
    }),
  ],
};
