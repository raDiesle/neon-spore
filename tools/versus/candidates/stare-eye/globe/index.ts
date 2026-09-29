import * as look from "../../../../../packages/render/src/stare-eye-look.js";
import { patch, type Variant } from "../../../variant.js";
import { paint } from "./paint.js";

/**
 * GLOBE — offered 29 September 2026, from the queue's *THE STARE's turn is a
 * squash-and-shear, not a placed surface*. The game turns the eye by
 * squashing a flat almond to a sliver and shearing it, which `.claude/skills/
 * depth` names as a coin being flipped: nothing on it can come out from
 * behind. This is the eye as a lit ball in the cowl whose opening, iris and
 * lashes are placed on its surface and carried round by the turn.
 */
export const STARE_GLOBE: Variant = {
  slot: "stare:eye",
  name: "globe",
  sentence:
    "globe — THE STARE's eye is a lit ball that turns in the cowl, its opening folded against the edge while it looks away and coming round to face you over the tell, instead of a flat eye squashed to a sliver",
  dir: "tools/versus/candidates/stare-eye/globe",
  patches: [
    patch({
      target: look.STARE_EYE,
      reached: () => look.STARE_EYE,
      where: {
        file: "packages/render/src/stare-eye-look.ts",
        symbol: "STARE_EYE",
        type: "{ paint: (ctx: CanvasRenderingContext2D, look: StareEyeLook) => void }",
      },
      fields: { paint },
    }),
  ],
};
