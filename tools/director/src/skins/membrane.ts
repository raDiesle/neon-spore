import { auraPass, fillPass, rimPass } from "./parts.js";
import type { Skin } from "./types.js";

/**
 * A dark fill and the game's own layered aura.
 *
 * Not an invention: `packages/render/src/glow.ts` draws creatures this way and
 * the sheet simply never did. On its own it answers the first half of the
 * question — is the card flat because the shape is flat, or because the sheet
 * is.
 */
export const MEMBRANE: Skin<"membrane"> = {
  id: "membrane",
  label: "MEMBRANE",
  hint: "dark fill and the game's layered aura",
  build(ctx) {
    fillPass(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
