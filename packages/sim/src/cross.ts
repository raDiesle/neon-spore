/**
 * **A body crossing the field and turning at its side walls**, as a rule two
 * creatures call rather than two creatures spell out.
 *
 * THE CAROM was the first, and while it was the only one the arithmetic lived
 * inside `stepCarom`. THE VOLLEY is the second and it crosses on the same
 * terms — a stride a beat, a wall it turns at — so the two would have been two
 * hand-written copies of one rule, which is exactly what `copies-table.ts`
 * exists to catch after the fact. It is one function here instead, and the
 * difference between the creatures is the stride they pass in and what each
 * does about a turn.
 *
 * **The turn lands *on* the wall rather than reflecting off it mid-beat.** THE
 * GHOST's rule (`stepGhostAcross`), and its reason: a stride that overshoots
 * is truncated so the body stands on the outermost column it can occupy, and
 * turns there. A body that reflected the remainder would spend the beat
 * somewhere no column names, and the two players are talking about columns.
 */

/** Which way across the field a body is going. `1` is to the right. */
export type CrossDir = -1 | 1;

/** Where one beat of crossing puts a body, and which way it goes next. */
export interface Crossing {
  col: number;
  dir: CrossDir;
  /** Whether this beat ended against a wall, which is what the ear gets. */
  turned: boolean;
}

/**
 * The rightmost column a body this wide may stand in. `span` rather than one,
 * because a two-column body turns a column early — the wall it touches and the
 * wall the shield has to cover are one number.
 */
function rightWall(cols: number, span: number): number {
  return Math.max(0, cols - span);
}

/**
 * One beat of crossing. A field narrower than the body has nowhere to cross
 * to, so the body stays where it is — not reachable at the shipped width, and
 * cheaper to answer than to leave as a loop that could not terminate.
 */
export function crossField(
  cols: number,
  col: number,
  span: number,
  dir: CrossDir,
  stride: number,
): Crossing {
  const hi = rightWall(cols, span);
  if (hi <= 0) return { col, dir, turned: false };
  const next = col + dir * stride;
  if (next >= 0 && next <= hi) return { col: next, dir, turned: false };
  // Over the edge. It lands on the wall and turns in the same beat, so there
  // is never a beat spent standing still against one.
  return { col: dir > 0 ? hi : 0, dir: dir === 1 ? -1 : 1, turned: true };
}

/**
 * Which way an arrival in this column sets off: **away from the nearer wall**,
 * so the first crossing is the long one.
 *
 * Deterministic, from the column and the field's own width. Nothing is rolled
 * — which way a body is going is on both screens from the first frame, and
 * what the pair has to work out is where it will be, not where it is headed.
 */
export function crossAwayFromWall(cols: number, col: number, span: number): CrossDir {
  return col < rightWall(cols, span) - col ? 1 : -1;
}
