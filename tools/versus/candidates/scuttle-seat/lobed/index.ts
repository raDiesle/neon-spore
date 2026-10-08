import * as seat from "../../../../../packages/render/src/scuttle-seat.js";
import { patch, type Variant } from "../../../variant.js";
import { paintLobe, paintWound } from "./paint.js";

/**
 * LOBED — offered 8 October 2026 (bosses-choreographed.md §15, *Not built*):
 * THE SCUTTLE's parts drawn as lobes of the one frame, each leaving a wound
 * when it goes, where the game seats a plate in a socket on a grid.
 */
export const SCUTTLE_LOBED: Variant = {
  slot: "scuttle:seat",
  name: "lobed",
  sentence:
    "lobed — each part a swell of the frame's own rock with no edge round it, and where one has gone a ragged wet wound dripping the violet inside",
  dir: "tools/versus/candidates/scuttle-seat/lobed",
  patches: [
    patch({
      target: seat.SEAT_LOOK,
      reached: () => seat.SEAT_LOOK,
      where: { file: "packages/render/src/scuttle-seat.ts", symbol: "SEAT_LOOK", type: "SeatLook" },
      fields: { seated: paintLobe, open: paintWound },
    }),
  ],
};
