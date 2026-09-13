/**
 * THE CAIRN's stack: how seven rocks are arranged, in one place.
 *
 * The pile is drawn twice — on the field (`render/cairn.ts`) and on the shape
 * sheet's card (`tools/shape-sheet/src/forms/pile.ts`) — and until 13
 * September 2026 each derived its own arrangement: the card stacked seven
 * three, three and one, and the field four, two and one, because four across
 * the base is what fills the five columns the pile stands in (`CAIRN_COLS` in
 * `sim/span.ts`). So the silhouette the owner judged was not the silhouette
 * the game draws, which is exactly what the shape sheet exists to prevent. The
 * figures live here, beside the other geometry both sides read, and neither
 * side derives them again.
 */

/**
 * The courses, bottom first: four across the base, two in the valleys above
 * them, one on top.
 *
 * **Bottom first is also the order the units leave in.** A pile of `n` is the
 * first `n` slots of this stack, so a pile losing rocks loses the apex, then
 * the middle course, then the base — the one order that leaves a pile looking
 * like a pile the whole way down. Restacking the remainder on every pull would
 * move every rock on the field at the moment the pair is trying to read one
 * lane.
 */
export const CAIRN_COURSES: readonly number[] = [4, 2, 1];

/**
 * How far two neighbours are driven into each other, as a share of the reach
 * they would need to just touch — sideways and upward. The seam is the whole
 * shape: at nothing the pile falls apart, and much past a fifth the rocks
 * swallow each other and it draws one lumpy boulder. Sideways is where the
 * counting happens, so it is bitten less than the courses are. Tuned by eye
 * on the shape sheet's card; nothing else about the stack is a matter of
 * taste.
 */
export const CAIRN_BITE_ACROSS = 0.16;
export const CAIRN_BITE_UP = 0.2;

/**
 * The courses a pile of `units` rocks fills, bottom first — the full stack for
 * seven, and the same stack cut short for fewer, so a card of a part-pulled
 * pile and the field's own shrinking one agree about which rocks are left.
 */
export function cairnCourses(units: number): number[] {
  const rows: number[] = [];
  let left = units;
  for (const n of CAIRN_COURSES) {
    if (left <= 0) break;
    rows.push(Math.min(n, left));
    left -= n;
  }
  return rows;
}
