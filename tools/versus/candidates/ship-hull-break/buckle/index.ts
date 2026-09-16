import * as look from "../../../../../packages/render/src/hull-break-look.js";
import { patch, type Variant } from "../../../variant.js";
import { buckle, OPEN } from "./paint.js";

/**
 * `ship:hull-break` / `buckle` — no new material at all: the ship's own
 * membrane pressed in at the column it was hit, with stress lines running out
 * of the dent along the skin both ways.
 *
 * **What the shipped side is.** A pit and a crack, for `peel`'s reasons.
 *
 * **What this argues.** That the other two answers add things to a picture
 * that is already dense — flaps, cavities, ribs, vents — and that the cheapest
 * way to say a ship is hurt is to bend it. The dent rides `skinY`, so it is
 * the ship's own outline deformed rather than a shape laid over it, and it is
 * the one answer here that reaches wide enough to be read at a glance: two
 * tiles of hull out of shape, against a hole a third of a tile across.
 *
 * **How it can lose.** It may simply be too quiet for the most expensive
 * event in the game, and a dent in a membrane that already breathes
 * (`hull-frame.ts`) can read as the ship's own motion rather than as damage.
 */
export const HULL_BREAK_BUCKLE: Variant = {
  slot: "ship:hull-break",
  name: "buckle",
  sentence:
    "the ship's own membrane pressed in over two tiles at the column it was hit, with three short stress lines each way out of the dent — the hull bent rather than anything added to it",
  dir: "tools/versus/candidates/ship-hull-break/buckle",
  patches: [
    patch({
      target: look.HULL_BREAK_LOOK,
      reached: () => look.HULL_BREAK_LOOK,
      where: {
        file: "packages/render/src/hull-break-look.ts",
        symbol: "HULL_BREAK_LOOK",
        type: "HullBreakLook",
      },
      fields: { open: OPEN, paint: buckle },
    }),
  ],
};
