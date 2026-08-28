import { auraPass, corePass, fillPass, rimPass } from "./parts.js";
import type { Skin } from "./types.js";

/**
 * MEMBRANE with a value gradient under it, falling outward to the card's own
 * dark rather than to the rim colour.
 *
 * That direction is the whole treatment and the reason it is a separate skin
 * rather than a tweak to MEMBRANE: `docs/alive.md` claims a gradient which
 * brightens the rim raises contrast and one which brightens the edge erodes
 * it, and the two are one stop apart.
 */
export const CORE: Skin<"core"> = {
  id: "core",
  label: "CORE",
  hint: "a value gradient under the skin, falling outward",
  build(ctx) {
    fillPass(ctx);
    corePass(ctx);
    auraPass(ctx);
    rimPass(ctx);
  },
};
