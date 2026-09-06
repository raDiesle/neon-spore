/**
 * **Where a sound is**: a column as a stereo position, and a row as a pitch.
 *
 * Cut out of `bind.ts` when THE FENCE took that file over its 250-line limit,
 * along the seam `bind-lookups.ts` was already cut on: next door is an
 * argument about *which sound a moment deserves*, one paragraph per event, and
 * this is two lines of arithmetic that every one of those arguments ends in.
 *
 * The pan is the column something happened in. Both players hear everything
 * (`docs/spec/systems.md` 5.3), so the ear is the fastest way to know *where* —
 * faster than the eye finding a tile, and much faster than a sentence.
 *
 * `bind.ts` re-exports both, so the six `bind-*.ts` files that import them
 * through it did not have to move.
 */

/** A column as a stereo position. The edges stop short of hard left and right. */
export function panForCol(col: number, cols: number): number {
  if (cols <= 1) return 0;
  return ((col / (cols - 1)) * 2 - 1) * 0.75;
}

/**
 * Higher up the field is higher in pitch — the same mapping the radar makes
 * with length. It is a small range on purpose: a fifth across the whole field,
 * so a sound is still recognisably itself wherever it happens.
 */
export function pitchForRow(row: number, rows: number): number {
  if (rows <= 1) return 1;
  const t = 1 - Math.min(1, Math.max(0, row / (rows - 1)));
  return 1 + t * 0.5;
}
