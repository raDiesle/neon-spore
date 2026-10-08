import * as rock from "../../../../../packages/render/src/lead-rock.js";
import { patch, type Variant } from "../../../variant.js";
import { paintCrags } from "./paint.js";

/**
 * CRAGS — offered 8 October 2026, the second of THE LEAD's three unbuilt
 * looks (bosses.md §11.29): the walls the body and its pass turn at, shown
 * on the ridge. The game runs the ridge out to the field's edges and draws
 * no wall at all.
 */
export const LEAD_CRAGS: Variant = {
  slot: "lead:walls",
  name: "crags",
  sentence:
    "crags — a crag of the ridge's rock stands on each end, its lit inner face cut with a hook curling back into the field where the body turns",
  dir: "tools/versus/candidates/lead-walls/crags",
  patches: [
    patch({
      target: rock.RIDGE_WALLS,
      reached: () => rock.RIDGE_WALLS,
      where: {
        file: "packages/render/src/lead-rock.ts",
        symbol: "RIDGE_WALLS",
        type: "RidgeWallsLook",
      },
      fields: { draw: paintCrags },
    }),
  ],
};
