import { AUTHORED_COLS } from "@neon-spore/content";

/**
 * The map's own arithmetic: how wide a cell is, how wide the column of beat
 * numbers is, how wide the strip of row buttons on its right is, and what the
 * lot comes to.
 *
 * Its own module because four places need the same numbers and used to hold
 * their own copies. `grid.ts` writes the track list from them, the rails in
 * `grid-row-acts.ts` sit against them, and `director-brush.css` caps
 * `#cellPanel` and `#gridNote` at the width they add up to — a block child
 * with no cap contributes its unwrapped line length to the column's
 * auto-sizing pass and pushes the map column wider than the map.
 *
 * That cap was written as a number in the stylesheet and was wrong by 32px
 * for two changes running. `test/map-width.test.ts` reads the stylesheet and
 * checks it against `mapWidthPx()`, so the next change to a track is caught
 * rather than eyeballed.
 */

/** One cell of the map, square. */
export const CELL_PX = 32;
/** Between every pair of tracks, across and down. */
export const GAP_PX = 2;
/** The beat numbers, with room at their left for the `+` that opens a row. */
export const BEAT_LABEL_PX = 40;
/**
 * The strip on the right that carries the trash that takes the row out, and
 * the bracket down the rows a fault holds.
 *
 * It was 70px for eight days, wide enough to write the longest fault's name
 * (HANDOVER) beside the trash, and every row without a fault spent the width
 * on nothing. The owner asked on 25 September 2026 for the name to go across
 * the middle of its row instead (`grid-row-acts.ts`'s `band`), so the strip is
 * back to the trash alone.
 */
export const ROW_ACT_PX = 22;

/** The nine tracks: the numbers, the seven authored columns, the buttons. */
export function gridTemplateColumns(): string {
  return `${BEAT_LABEL_PX}px repeat(${AUTHORED_COLS}, ${CELL_PX}px) ${ROW_ACT_PX}px`;
}

/** What the whole map comes to, the gaps between the nine tracks included. */
export function mapWidthPx(): number {
  const tracks = AUTHORED_COLS + 2;
  return BEAT_LABEL_PX + AUTHORED_COLS * CELL_PX + ROW_ACT_PX + (tracks - 1) * GAP_PX;
}
