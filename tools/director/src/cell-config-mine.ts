import type { WaveEntry } from "@neon-spore/content";
import { beadLabel, choiceRow, seatLabel } from "./cell-config-rows.js";
import {
  MINE_ROWS,
  MINE_SEATS,
  mineRowOf,
  mineSeatOf,
  setMineRow,
  setMineSeat,
} from "./entry-fields-mine.js";

/**
 * **THE MINE's two rows under the selected cell**, built here rather than in
 * `cell-config.ts` for `cell-config-gaps.ts`' reason: that file stands at its
 * 250-line limit and its own header says which half grows — every future
 * per-arrival number is a row there and nothing at all in the half that draws
 * one. These two arrived together and would have taken it over on their own.
 *
 * TILE is the row it stands on. The director's map is beats down and columns
 * across, so where in the *field* a body sits is the one coordinate that map
 * cannot show, and it has to be asked for in the panel above it —
 * `PodEntry.row`'s argument, one creature along.
 *
 * SEES is which seat is drawn the body, and it is the first split in this game
 * a **wave** chooses rather than a kind. That is why it is a setting here and
 * not a row in `creatures-table.ts`: the same three arrivals are the same
 * problem handed to each seat in turn, and an author composing a wave is
 * deciding whose tile it is (`WaveEntry.sees`).
 */
export function mineRows(entry: WaveEntry, onEdit: () => void): HTMLElement[] {
  return [
    choiceRow("TILE", MINE_ROWS, mineRowOf(entry), beadLabel, (row: number) => {
      setMineRow(entry, row);
      onEdit();
    }),
    choiceRow("SEES", MINE_SEATS, mineSeatOf(entry), seatLabel, (sees: 1 | 2) => {
      setMineSeat(entry, sees);
      onEdit();
    }),
  ];
}
