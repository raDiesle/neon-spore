import { PALETTE } from "../../../../../packages/render/src/palette.js";
import type { SirenWordsAt } from "../../../../../packages/render/src/siren-words-look.js";
import { drawPlate, keepOn, PLATE_H, plateWidth } from "../plate.js";

/** Between the chip's ring and the tag's top, where the stem is. */
const STEM = 5;

/**
 * **A tag hanging from your own chip.** Only your word, on your phone: a plate
 * on a short stem from the chip that is ringed as *you*, edged in the same
 * purple as that ring. Nothing else on the screen is drawn in that colour up
 * here, so the tag and the ring read as one thing — this is you, and this is
 * what you say. Your partner's words are on your partner's phone. The test
 * screen, which is both seats, hangs each word from its own chip.
 */
export function tagWords(ctx: CanvasRenderingContext2D, at: SirenWordsAt): void {
  const seats =
    at.l.role === "test"
      ? (["p1", "p2"] as const)
      : at.l.role === "p1"
        ? (["p1"] as const)
        : (["p2"] as const);
  const top = at.cy + at.chipH / 2 + 2.5;
  const y = top + STEM + PLATE_H / 2;
  for (const seat of seats) {
    const word = at.words[seat];
    if (word === null) continue;
    const chip = at.chips[seat];
    const w = plateWidth(ctx, word);
    const x = keepOn(chip.x, w, at.l.width, 6);
    ctx.save();
    ctx.strokeStyle = PALETTE.hull;
    ctx.globalAlpha = 0.95;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.moveTo(chip.x, top);
    ctx.lineTo(chip.x, top + STEM);
    ctx.stroke();
    ctx.restore();
    drawPlate(ctx, word, x, y, PALETTE.hull, true);
  }
}
