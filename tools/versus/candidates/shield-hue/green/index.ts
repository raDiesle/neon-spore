import * as palette from "../../../../../packages/render/src/palette.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * `shield:hue` / `green` — the shield in acid green.
 *
 * **What the shipped side is.** The shield, its rim and the SHIELD button are
 * `PALETTE.shield` and `shieldRim`, `#2FE0F0` and `#BFF6FF` — the same two
 * hexes as `PALETTE.cyan` and `cyanRim`, the cyan shot. The owner, 19 October
 * 2026: *very similar to the cyan shoot*, and he asked for something unique —
 * neon pink or green.
 *
 * **What this argues.** That a lime green is the one hue on the field no
 * shot and no body owns: it leans yellow where cyan leans blue, so the eye
 * splits the two at once, and it is nowhere near red.
 *
 * **How it can lose.** *Green already means "right".* `PALETTE.good`, the mint
 * of a Simon round answered in full, is green too — a lit shield may read as a
 * verdict rather than as a wall.
 */
export const SHIELD_GREEN: Variant = {
  slot: "shield:hue",
  name: "green",
  sentence:
    "the shield, its rim and the SHIELD button in acid green — nothing the player defends with is the colour of a shot any more",
  dir: "tools/versus/candidates/shield-hue/green",
  patches: [
    patch({
      // `as const`, so a cast at the target (README).
      target: palette.PALETTE as { shield: string; shieldRim: string },
      // No accessor: every draw path reads the export itself.
      reached: () => palette.PALETTE,
      where: { file: "packages/render/src/palette.ts", symbol: "PALETTE" },
      fields: { shield: "#8CFF3A", shieldRim: "#D6FFB0" },
    }),
  ],
};
