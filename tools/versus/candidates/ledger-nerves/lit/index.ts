import * as nerves from "../../../../../packages/render/src/ledger-nerves.js";
import { patch, type Variant } from "../../../variant.js";
import { paintLitNerves } from "./paint.js";

/**
 * LIT — offered 8 October 2026, the first of THE LEDGER's two unbuilt looks
 * the owner asked for in VERSUS once he kept the boss: the design's
 * `ship-nerves.ts` *lit along the cord's line* (bosses-choreographed.md §5).
 * The game says a return landing with the shock through the plating and
 * nothing before it; this lights the ship's nerves under the socket as the
 * bead comes down, on the navigator's screen alone.
 */
export const LEDGER_LIT: Variant = {
  slot: "ledger:nerves",
  name: "lit",
  sentence:
    "lit — the ship's nerves under the socket light from the socket outward as a return comes down the cord, all of them on the beat it lands",
  dir: "tools/versus/candidates/ledger-nerves/lit",
  patches: [
    patch({
      target: nerves.LEDGER_NERVES,
      reached: () => nerves.LEDGER_NERVES,
      where: {
        file: "packages/render/src/ledger-nerves.ts",
        symbol: "LEDGER_NERVES",
        type: "LedgerNerves",
      },
      fields: { draw: paintLitNerves },
    }),
  ],
};
