import { AUTHORED_COL_MAX, type WaveEntry } from "@neon-spore/content";

/**
 * **Where a wall is open**, read and written on one arrival.
 *
 * Its own file beside `entry-fields-rock.ts`, and for that file's reason:
 * `entry-fields.ts` was fourteen lines under its limit the day THE GRATE was
 * written. The better reason is that this is the first per-arrival fact that
 * is a **set** rather than a choice — every other row under the map picks one
 * of a handful of values, and this one turns columns on and off — so the
 * reading and the writing are a different shape from everything next door.
 *
 * Nothing here knows a panel exists. `cell-config-gaps.ts` draws it.
 */

/** The columns a wall may be opened in: the seven every wave is authored
 * against, read off `AUTHORED_COL_MAX` rather than typed out, so a field that
 * ever widens does not leave a panel offering six of seven. */
export const GAP_COLS: readonly number[] = Array.from(
  { length: AUTHORED_COL_MAX + 1 },
  (_, i) => i,
);

/** Whether this entry is a wall, and therefore has gaps to set. The one kind
 * that does: `gaps` means nothing on anything else, and a row offered on a
 * slick would write a field the simulation never reads. */
export function hasGrateGaps(entry: WaveEntry): boolean {
  return entry.kind === "grate";
}

/**
 * The columns this wall is open in, sorted. Unset means the one the wall was
 * painted in, which is `queueFromWave`'s own default asked rather than
 * repeated — so the panel shows the gap the field will actually have and never
 * a blank row on a wall that has one.
 */
export function grateGapsOf(entry: WaveEntry): number[] {
  return [...(entry.gaps ?? [entry.col])].sort((a, b) => a - b);
}

/**
 * Turn one column's gap on or off.
 *
 * **The last gap cannot be taken away.** A wall with no way through is not a
 * creature — `grateMask` says so in the simulation, and a panel that let one
 * be authored would be a panel offering a wave the field then quietly refuses.
 * So a click that would empty the set is ignored, and the chip stays lit.
 *
 * A set that comes back to exactly the painted column is written as *no field*
 * rather than as a list of one, `setGhostPath`'s arrangement: a wall nobody
 * has widened serialises exactly as it did before anybody clicked.
 */
export function toggleGrateGap(entry: WaveEntry, col: number): void {
  const gaps = new Set(grateGapsOf(entry));
  if (gaps.has(col)) {
    if (gaps.size === 1) return;
    gaps.delete(col);
  } else {
    gaps.add(col);
  }
  const next = [...gaps].sort((a, b) => a - b);
  entry.gaps = next.length === 1 && next[0] === entry.col ? undefined : next;
}
