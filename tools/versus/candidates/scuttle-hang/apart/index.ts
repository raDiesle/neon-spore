import * as look from "../../../../../packages/render/src/scuttle-shape.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * The rows stand further apart and a loose part falls less than the gap, so
 * it rests clear of the socket below it. The bottom row comes down to keep
 * the frame's top where it was, under the HUD's pills.
 */
export const HANG_APART: Variant = {
  slot: "scuttle:hang",
  name: "apart",
  sentence:
    "the rows further apart — a loose part falls less than the gap, so it hangs between sockets and never over the one below",
  dir: "tools/versus/candidates/scuttle-hang/apart",
  patches: [
    patch({
      target: look.SCUTTLE_ROWS,
      reached: () => look.SCUTTLE_ROWS,
      where: {
        file: "packages/render/src/scuttle-shape.ts",
        symbol: "SCUTTLE_ROWS",
        type: "ScuttleRows",
      },
      fields: { rise: 0.4, pitch: 0.6, drop: 0.26 },
    }),
  ],
};
