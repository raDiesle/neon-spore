/**
 * **What THE BULB QUEEN reports**, off the beat and the thumb.
 *
 * The open and the shut are state (`pryBeat`, `holdSide`, `queen.color`), and
 * the mixer sounds them off the colour toggling (`audio/mixer-boss.ts`). What
 * is said here is the thumb's answer, one event per verdict a mark is washed
 * in (`render/queen-fx.ts`, `render/grip-verdict.ts`):
 *
 * - **`queenFlinch`**, the miss a `pry` has: player 1's thumb on the mark that
 *   was *not* the real one. The mark shuts before it opened, which the colour
 *   never shows.
 * - **`queenPry`**, the pry that landed: his thumb on the real mark, which
 *   opens under it.
 * - **`queenHold`**, a thumb come down on a mark under SCREAM's `hold`, with
 *   whether it is the real one — the one that keeps her open.
 * - **`queenRefuse`**, a press from player 2, whose thumb the marks are not
 *   for (`queen-hand.ts`). Nothing moves; the mark is told so in red.
 */
interface QueenMarkEvent {
  /** The column of the mark that was pressed. */
  col: number;
  /** Her row, which is the row the mark hangs under (`render/queen-figure.ts`). */
  row: number;
  /** Which of her two marks it was, -1 left, 1 right. */
  side: -1 | 1;
}

export type QueenEvent =
  | ({ type: "queenFlinch" } & QueenMarkEvent)
  | ({ type: "queenPry" } & QueenMarkEvent)
  | ({ type: "queenHold"; real: boolean } & QueenMarkEvent)
  | ({ type: "queenRefuse"; player: 1 | 2 } & QueenMarkEvent);
