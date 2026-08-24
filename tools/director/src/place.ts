import { AUTHORED_COLS, mapCol } from "@neon-spore/content";

/**
 * The authored column whose place on the field is nearest to `fieldCol`.
 *
 * Only seven of the field's columns are reachable — a wave is authored against
 * seven and `mapCol` spreads them — so a click between two of them snaps to the
 * nearer, and to the lower one when it falls exactly between.
 */
export function authoredColAt(fieldCol: number, cols: number): number {
  let bestCol = 0;
  let bestDist = Math.abs(mapCol(0, cols) - fieldCol);
  for (let c = 1; c < AUTHORED_COLS; c++) {
    const mapped = mapCol(c, cols);
    const dist = Math.abs(mapped - fieldCol);
    if (dist < bestDist) {
      bestDist = dist;
      bestCol = c;
    }
  }
  return bestCol;
}
