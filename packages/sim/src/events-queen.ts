/**
 * **What THE BULB QUEEN reports**, off the beat and the thumb.
 *
 * One event, and it is the miss a `pry` now has: player 1's thumb on the
 * mark that was *not* the real one. The pry that lands and the hold that
 * keeps her open are state (`pryBeat`, `holdSide`, `queen.color`) and the
 * mixer already sounds the open and the shut off the colour toggling
 * (`audio/mixer-boss.ts`), so neither needs a line here. The flinch does:
 * the mark shuts before it opened, which the colour never shows.
 */
export type QueenEvent = {
  type: "queenFlinch";
  /** The column of the mark that was pressed. */
  col: number;
  /** Which of her two marks it was, -1 left, 1 right. */
  side: -1 | 1;
};
