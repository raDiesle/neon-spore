import * as palette from "../../../../../packages/render/src/palette.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `shield:hue` / `pink` — the shield in neon pink.
 *
 * **What the shipped side is.** The shield, its rim and the SHIELD button are
 * `PALETTE.shield` and `shieldRim`, `#2FE0F0` and `#BFF6FF` — the same two
 * hexes as `PALETTE.cyan` and `cyanRim`, the cyan shot. The owner, 19 October
 * 2026: *very similar to the cyan shoot*, and he asked for something unique —
 * neon pink or green.
 *
 * **What this argues.** That a hot pink is as far from both shots as a hue
 * gets: it is not blue at all, so it cannot be read as cyan, and it is bright
 * and cold where the red shot is deep and warm.
 *
 * **How it can lose.** *Pink is red's neighbour.* The red shot, `#FF3B6B`, is a
 * pinkish red, and the hull's violet sits on the other side — a pair asked
 * which button fires red may hesitate over this one.
 */
export const SHIELD_PINK: Variant = {
  slot: "shield:hue",
  name: "pink",
  sentence:
    "the shield, its rim and the SHIELD button in neon pink — nothing the player defends with is the colour of a shot any more",
  dir: "tools/versus/candidates/shield-hue/pink",
  patches: [
    patch({
      // `as const`, so a cast at the target (README).
      target: palette.PALETTE as { shield: string; shieldRim: string },
      // No accessor: every draw path reads the export itself.
      reached: () => palette.PALETTE,
      where: { file: "packages/render/src/palette.ts", symbol: "PALETTE" },
      fields: { shield: "#FF4FD8", shieldRim: "#FFA8F0" },
    }),
  ],
};
