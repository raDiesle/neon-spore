import { SIREN_PAD } from "../../../../../packages/render/src/siren-seats.js";
import type { SirenWordsAt } from "../../../../../packages/render/src/siren-words-look.js";
import { drawPlate, isMine, keepOn, PLATE_H, plateWidth, seatTint } from "../plate.js";

/** Between a chip and the plate beside it. */
const GAP = 3;

/**
 * **Each word beside its own name, on the bar's own row.** P1's word to the
 * left of P1's chip and P2's to the right of P2's, so a line reads *COLOUR ·
 * P1 · bar · P2 · FAKE* and a word belongs to the name it touches. No row
 * under the chips at all — the whole siren is one line tall, which is as
 * little of the field as it can cover. A word too long for its side of the
 * row drops under its chip instead.
 */
export function besideWords(ctx: CanvasRenderingContext2D, at: SirenWordsAt): void {
  const width = at.l.width;
  for (const seat of ["p1", "p2"] as const) {
    const word = at.words[seat];
    if (word === null) continue;
    const w = plateWidth(ctx, word);
    const chip = at.chips[seat];
    const x = seat === "p1" ? chip.x - chip.w / 2 - GAP - w / 2 : chip.x + chip.w / 2 + GAP + w / 2;
    // The run's line holds the top left and the ☰ the top right; a plate that
    // would reach either goes under its chip.
    const fits = x - w / 2 >= 6 && x + w / 2 <= width - SIREN_PAD;
    const mine = isMine(at.l.role, seat);
    if (fits) drawPlate(ctx, word, x, at.cy, seatTint(seat), mine);
    else {
      const y = at.cy + at.chipH / 2 + 3 + PLATE_H / 2;
      drawPlate(ctx, word, keepOn(chip.x, w, width, 6), y, seatTint(seat), mine);
    }
  }
}
