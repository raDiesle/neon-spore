import { AUTHORED_COL_MAX, type WaveEntry } from "@neon-spore/content";

/**
 * **Where a fence is open**, read and written on one arrival.
 *
 * Its own file beside `entry-fields-rock.ts`, and for that file's reason:
 * `entry-fields.ts` was fourteen lines under its limit the day THE FENCE was
 * written. The better reason is that this is the first per-arrival fact that
 * is a **set** rather than a choice — every other row under the map picks one
 * of a handful of values, and this one turns columns on and off — so the
 * reading and the writing are a different shape from everything next door.
 *
 * Nothing here knows a panel exists. `cell-config-gaps.ts` draws it.
 */

/** The columns a fence may be opened in: the seven every wave is authored
 * against, read off `AUTHORED_COL_MAX` rather than typed out, so a field that
 * ever widens does not leave a panel offering six of seven. */
export const GAP_COLS: readonly number[] = Array.from(
  { length: AUTHORED_COL_MAX + 1 },
  (_, i) => i,
);

/** Whether this entry is a fence, and therefore has gaps to set. The one kind
 * that does: `gaps` means nothing on anything else, and a row offered on a
 * slick would write a field the simulation never reads. */
export function hasFenceGaps(entry: WaveEntry): boolean {
  return entry.kind === "fence";
}

/**
 * The columns this fence is open in, sorted. Unset means the one it was
 * painted in, which is `queueFromWave`'s own default asked rather than
 * repeated — so the panel shows the gap the field will actually have and never
 * a blank row on a fence that has one. An **empty list is a real answer** and
 * not an unset one: a fence with every chip dark is a solid fence, which is
 * the hardest thing this creature can be.
 */
export function fenceGapsOf(entry: WaveEntry): number[] {
  return [...(entry.gaps ?? [entry.col])].sort((a, b) => a - b);
}

/**
 * Turn one column's gap on or off.
 *
 * **The last gap may be taken away, and that is the point of the row.** It
 * could not be for a while: a fence with no way through was refused here and
 * given a middle gap in the simulation, on the argument that a wall nobody can
 * pass is a fixed price with a picture on it rather than a creature. The
 * cannon can cut one now (`fenceBurn`), so a solid fence is answerable by the
 * seat the authored gaps were never for — and it is the shape of this creature
 * the owner asked for by name.
 *
 * A set that comes back to exactly the painted column is written as *no field*
 * rather than as a list of one, `setGhostPath`'s arrangement: a fence nobody
 * has widened serialises exactly as it did before anybody clicked. An empty
 * set is written as an empty list, because it is a decision and absent already
 * means something else.
 */
export function toggleFenceGap(entry: WaveEntry, col: number): void {
  const gaps = new Set(fenceGapsOf(entry));
  if (gaps.has(col)) gaps.delete(col);
  else gaps.add(col);
  const next = [...gaps].sort((a, b) => a - b);
  entry.gaps = next.length === 1 && next[0] === entry.col ? undefined : next;
}
