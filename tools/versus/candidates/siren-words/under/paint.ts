import type { SirenWordsAt } from "../../../../../packages/render/src/siren-words-look.js";
import { drawPlate, isMine, keepOn, PLATE_H, plateWidth, seatTint } from "../plate.js";

/**
 * **Each word under its own name.** Both seats' words on both phones, each
 * hung directly under the chip that names its seat, edged in that seat's hull
 * colour — violet under P1, amber under P2. Whose it is is read off *where* it
 * is: under your name is yours. Yours is bright and your partner's is quieter,
 * so you see what you owe first and what they owe when you look for it.
 * One row under the chips, as the shipped line is.
 */
export function underWords(ctx: CanvasRenderingContext2D, at: SirenWordsAt): void {
  const y = at.cy + at.chipH / 2 + 3 + PLATE_H / 2;
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
