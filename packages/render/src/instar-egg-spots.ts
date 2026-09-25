/**
 * **Where THE INSTAR's eggs sit in their two nests**, in head radii from the
 * nest's middle: one egg per tap or swipe its mark needs, so the tables are
 * as long as the script's counts and `test/instar-eggs.test.ts` holds them
 * to it. Cut off `instar-eggs.ts` when the counts doubled, 25 September 2026.
 *
 * Each table runs back row first: the drawer lays eggs in order and a counted
 * tap or swipe takes the last, so the front row goes first and uncovers the
 * one behind it — the heap is seen going down rather than thinning out.
 */

/** The swiped nest: three at the back, four, three at the front. */
export const SPOTS: readonly (readonly [number, number])[] = [
  [-0.14, -0.3],
  [0, -0.32],
  [0.14, -0.3],
  [-0.3, -0.14],
  [-0.1, -0.16],
  [0.1, -0.16],
  [0.3, -0.14],
  [-0.2, 0.02],
  [0, 0],
  [0.2, 0.02],
];

/** The squashed nest: four at the back, five, seven at the front. */
export const SPOTS_NEST: readonly (readonly [number, number])[] = [
  [-0.24, -0.34],
  [-0.08, -0.36],
  [0.08, -0.36],
  [0.24, -0.34],
  [-0.36, -0.18],
  [-0.18, -0.2],
  [0, -0.21],
  [0.18, -0.2],
  [0.36, -0.18],
  [-0.45, -0.01],
  [-0.3, 0.01],
  [-0.15, 0],
  [0, 0.01],
  [0.15, 0],
  [0.3, 0.01],
  [0.45, -0.01],
];
