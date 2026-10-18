import type { Layout } from "./layout.js";
import {
  drawPlate,
  isMine,
  keepOn,
  PLATE_DROP,
  PLATE_H,
  plateWidth,
  seatTint,
} from "./siren-words-plate.js";

/** Where the words go: the screen, the bar and the two chips beside it. */
export interface SirenWordsAt {
  /** The screen — its width, and whose seat it is (`l.role`, already traded
   * back under THE HANDOVER; `test` is both seats at once and nobody's own). */
  l: Layout;
  /** The bar's middle. */
  cx: number;
  cy: number;
  /** Each chip's middle across and its width; both are level with the bar. */
  chips: { p1: { x: number; w: number }; p2: { x: number; w: number } };
  /** How tall a chip is: its top and bottom are `cy` ∓ half of it. */
  chipH: number;
  /** The word each seat owes this beat, or null. */
  words: { p1: string | null; p2: string | null };
}

/**
 * **Each word under its own name.** Both seats' words on both phones, each
 * hung directly under the chip that names its seat, edged in that seat's hull
 * colour — violet under P1, amber under P2. Whose it is is read off *where* it
 * is: under your name is yours. Yours is bright and your partner's is quieter,
 * so you see what you owe first and what they owe when you look for it.
 * One row under the chips.
 *
 * The owner took it from VERSUS on 18 October 2026 (`siren:words`, over
 * `beside` and `tag`); before it the siren wrote this seat's word alone,
 * small and dim, centred under the bar.
 */
export function underWords(ctx: CanvasRenderingContext2D, at: SirenWordsAt): void {
  const y = at.cy + at.chipH / 2 + PLATE_DROP + PLATE_H / 2;
  for (const seat of ["p1", "p2"] as const) {
    const word = at.words[seat];
    if (word === null) continue;
    const w = plateWidth(ctx, word);
    // Under its own chip, never across the middle into the other's side.
    const toward =
      seat === "p1"
        ? Math.min(at.chips.p1.x, at.cx - 3 - w / 2)
        : Math.max(at.chips.p2.x, at.cx + 3 + w / 2);
    const x = keepOn(toward, w, at.l.width, 6);
    drawPlate(ctx, word, x, y, seatTint(seat), isMine(at.l.role, seat));
  }
}
