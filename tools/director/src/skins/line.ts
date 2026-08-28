import { rimPass } from "./parts.js";
import type { Skin } from "./types.js";

/**
 * The outline, and nothing else.
 *
 * Exactly what the cards drew before skins existed, kept as the control:
 * a comparison against nothing is how a new look wins by being new. It is the
 * one skin that must never gain a treatment, and the shortest file here is the
 * point rather than an accident.
 */
export const LINE: Skin<"line"> = {
  id: "line",
  label: "LINE",
  hint: "outline only — what the cards drew before",
  build(ctx) {
    rimPass(ctx);
  },
};
