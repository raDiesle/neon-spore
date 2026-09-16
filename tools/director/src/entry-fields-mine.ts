import type { WaveEntry } from "@neon-spore/content";
import { DEFAULT_CONFIG, mineRows } from "@neon-spore/sim";

/**
 * **THE MINE's two per-arrival facts**, and the first pair in this game that
 * are not about how a body moves or what it is made of: *where it stands* and
 * *which seat is drawn it*.
 *
 * Its own file rather than two more exports from `entry-fields.ts`, for
 * `entry-fields-fence.ts`' reason exactly: that file stands one line under its
 * 250-line limit, and these two belong together in any case — neither means
 * anything without the other. A tile nobody is told is not a sentence, and a
 * seat with no tile under it has nothing to say.
 */

/** The rows a mine may be placed on, read off the simulation's own band rather
 * than typed out — `STRAND_COUNTS`' arrangement and its reason: `minePlaceRow`
 * is what clamps, and a second list would be a panel offering a row the field
 * then quietly moves the body off. */
const BAND = mineRows(DEFAULT_CONFIG);
export const MINE_ROWS: readonly number[] = Array.from(
  { length: BAND.bottom - BAND.top + 1 },
  (_, i) => BAND.top + i,
);

/** Which seats a mine may be drawn to. Both, and only both: there is no
 * *neither*, because a body no screen carries is a body nobody can answer. */
export const MINE_SEATS: readonly (1 | 2)[] = [1, 2];

/** Whether this entry is a mine, and therefore has a tile and a seat to set.
 * The one kind that does — `sees` means nothing on anything else, and a row
 * offered on a slick would write a field the simulation never reads. */
export function hasMineFields(entry: WaveEntry): boolean {
  return entry.kind === "mine";
}

/** The row it stands on. Unset means the top of the band, which is what
 * `minePlaceRow` answers, so the number under the map is the row the field
 * will build. */
export function mineRowOf(entry: WaveEntry): number {
  return Math.max(BAND.top, Math.min(BAND.bottom, entry.row ?? BAND.top));
}

/** Set the row. The band's top is written as *no* field rather than as the
 * number itself, for `setBeadCount`'s reason: an arrival left where the panel
 * opened it serialises exactly as it always did. */
export function setMineRow(entry: WaveEntry, row: number): void {
  entry.row = row === BAND.top ? undefined : row;
}

/** The seat this one is drawn to. Unset means the navigator, which is the
 * seat a wisp is drawn on and the default `mineOnSpawn` reads. */
export function mineSeatOf(entry: WaveEntry): 1 | 2 {
  return entry.sees === 1 ? 1 : 2;
}

/** Set the seat, with the navigator written as no field at all. */
export function setMineSeat(entry: WaveEntry, sees: 1 | 2): void {
  entry.sees = sees === 2 ? undefined : sees;
}
