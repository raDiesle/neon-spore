import * as drop from "../../../../../packages/render/src/lead-drop.js";
import { patch, type Variant } from "../../../variant.js";
import { paintTornDrops } from "./paint.js";

/**
 * TORN — offered 8 October 2026, the last of THE LEAD's three unbuilt looks
 * (bosses.md §11.29): the torch and the rock falling out of the body, where
 * the game has them arrive under the ridge with a puff of sparks.
 */
export const LEAD_TORN: Variant = {
  slot: "lead:drop",
  name: "torn",
  sentence:
    "torn — the ridge's underside tears open over the column and the torch or rock hangs from it on a strand of flesh that parts; a cord from the mound on the navigator's screen alone",
  dir: "tools/versus/candidates/lead-drop/torn",
  patches: [
    patch({
      target: drop.DROP_LOOK,
      reached: () => drop.DROP_LOOK,
      where: { file: "packages/render/src/lead-drop.ts", symbol: "DROP_LOOK", type: "DropLook" },
      fields: { draw: paintTornDrops },
    }),
  ],
};
