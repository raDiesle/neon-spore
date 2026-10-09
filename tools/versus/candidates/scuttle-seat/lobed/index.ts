import * as seat from "../../../../../packages/render/src/scuttle-seat.js";
import * as shape from "../../../../../packages/render/src/scuttle-shape.js";
import { patch, type Variant } from "../../../variant.js";
import { paintLobe, paintWound } from "./paint.js";

/**
 * LOBED — offered 8 October 2026 (bosses-choreographed.md §15, *Not built*):
 * THE SCUTTLE's parts drawn as lobes of the one frame, each leaving a wound
 * when it goes, where the game seats a plate in a socket on a grid.
 *
 * Roomier from 9 October 2026, the owner: "some wider but much taller, that
 * things are not so tight together". The columns are the field's and cannot
 * spread, so the frame grows past its outer lobes and the rows stand further
 * apart — its top 2.5 tiles over the grid rather than 1.6, still under the
 * HUD's pills — and each lobe is slimmer, so rock shows between them.
 */
export const SCUTTLE_LOBED: Variant = {
  slot: "scuttle:seat",
  name: "lobed",
  sentence:
    "lobed — each part a swell of the frame's own rock with no edge round it, and where one has gone a ragged wet wound dripping the violet inside; the frame taller and a little wider, so the lobes stand apart",
  dir: "tools/versus/candidates/scuttle-seat/lobed",
  patches: [
    patch({
      target: seat.SEAT_LOOK,
      reached: () => seat.SEAT_LOOK,
      where: { file: "packages/render/src/scuttle-seat.ts", symbol: "SEAT_LOOK", type: "SeatLook" },
      fields: { seated: paintLobe, open: paintWound },
    }),
    patch({
      target: shape.SCUTTLE_ROWS,
      reached: () => shape.SCUTTLE_ROWS,
      where: {
        file: "packages/render/src/scuttle-shape.ts",
        symbol: "SCUTTLE_ROWS",
        type: "ScuttleRows",
      },
      fields: { rise: 0.42, pitch: 0.85 },
    }),
    patch({
      target: shape.SCUTTLE_FRAME,
      reached: () => shape.SCUTTLE_FRAME,
      where: {
        file: "packages/render/src/scuttle-shape.ts",
        symbol: "SCUTTLE_FRAME",
        type: "ScuttleFrame",
      },
      fields: { padX: 0.4, padY: 0.26 },
    }),
  ],
};
