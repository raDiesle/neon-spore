import * as look from "../../../../../packages/render/src/scuttle-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * The frame as it is, and a loose part that only sags out of its socket: a
 * tenth of a tile, which ends just above the socket below. What it gives up
 * is the slide — the thread is most of what says the part is loose.
 */
export const HANG_SHORT: Variant = {
  slot: "scuttle:hang",
  name: "short",
  sentence:
    "the frame unchanged — a loose part only sags a tenth of a tile, so it stops just above the socket below",
  dir: "tools/versus/candidates/scuttle-hang/short",
  patches: [
    patch({
      target: look.SCUTTLE_ROWS,
      reached: () => look.SCUTTLE_ROWS,
      where: {
        file: "packages/render/src/scuttle-shape.ts",
        symbol: "SCUTTLE_ROWS",
        type: "ScuttleRows",
      },
      fields: { rise: 0.55, pitch: 0.42, drop: 0.1 },
    }),
  ],
};
