import * as look from "../../../../../packages/render/src/lost-look.js";
import { patch, type Variant } from "../../../variant.js";
import { oneRun } from "./paint.js";

/**
 * ONE — the shipped bleed with twelve of its thirteen runs taken away.
 *
 * The control in this slot's four. `slime` and `splash` answer the owner's
 * *much slower, fewer elements* by changing the substance and the colour;
 * this one changes the count and the speed and nothing else, so what the vote
 * is actually about becomes readable. If ONE wins, the shipped picture was
 * only ever too busy. If it loses to a red one, the colour was the argument
 * all along, and the sheet says which.
 */
export const LOST_ONE: Variant = {
  slot: "lost:screen",
  name: "one",
  sentence:
    "one — a single violet rivulet a tile wide comes down the column the hull was broken in, taking twelve seconds to reach it, wandering and thickening behind its own head",
  dir: "tools/versus/candidates/lost-screen/one",
  patches: [
    patch({
      target: look.LOST_LOOK,
      reached: () => look.LOST_LOOK,
      where: {
        file: "packages/render/src/lost-look.ts",
        symbol: "LOST_LOOK",
        type: "LostLook",
      },
      fields: { veil: oneRun },
    }),
  ],
};
