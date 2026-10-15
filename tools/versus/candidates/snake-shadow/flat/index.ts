import * as skin from "../../../../../packages/render/src/snake-skin.js";
import { patch, type Variant } from "../../../variant.js";
import { paintFlat } from "./paint.js";

export const SNAKE_FLAT: Variant = {
  slot: "snake:shadow",
  name: "flat",
  sentence:
    "the floor shadow without a blur — the shape filled dark and offset under three widened faint strokes, as far and as dark as the blurred one",
  dir: "tools/versus/candidates/snake-shadow/flat",
  patches: [
    patch({
      target: skin.FLOOR_SHADOW,
      // The body, the jaws, the venom and the arena's items read the export itself.
      reached: () => skin.FLOOR_SHADOW,
      where: {
        file: "packages/render/src/snake-skin.ts",
        symbol: "FLOOR_SHADOW",
        type: "FloorShadow",
      },
      fields: { paint: paintFlat },
    }),
  ],
};
