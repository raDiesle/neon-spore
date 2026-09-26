/**
 * **Whose thumb a mark wants, read off where it is** — the spec's
 * `GeometrySeat` (`docs/spec/bosses-choreographed.md` §24).
 *
 * Both screens draw the same field, so "nearer" can only mean one thing: the
 * half of it the mark sits over. The left half is Player 1's and the right
 * half Player 2's, the convention THE MANTLE's two handles and THE GIMBAL's
 * two rings already keep. A mark over the exact middle column of an odd field
 * is in neither half, and either thumb may take it — `null`.
 *
 * THE KEEL is the first caller, and its joint is the first mark on the field
 * whose seat changes every time it moves. A later boss that wants the same
 * trick calls this rather than comparing a column with `midCol` itself
 * (`test/copies-table.ts`).
 */
export function geometrySeat(col: number, cols: number): 1 | 2 | null {
  const twice = 2 * col + 1;
  if (twice < cols) return 1;
  if (twice > cols) return 2;
  return null;
}
