import type { ViewState } from "./renderer.js";

/**
 * Where a round's header starts: on its own line, or under a plate that
 * stands over it.
 *
 * Every round writes its name at the top of the screen and its state in a row
 * or two beneath, and every rehearsal of one put the tutorial plate on top of
 * exactly that — two things in one place, neither legible, on every boss wave
 * with a film. The plate is where the owner put it and stays; the header is
 * the one that moves, because a name a few lines lower is still the name and
 * a plate in a different corner on some waves is a plate the eye has to find.
 *
 * `own` is the baseline the header sits on when nothing is over it, and it is
 * what comes back whenever the view names no `clearTop` — the game itself,
 * a frame test, the director. The rows under the name keep their distance
 * from it, so a header moves as one thing.
 */
export function headerTop(view: ViewState, own: number): number {
  const under = view.clearTop;
  return under === undefined ? own : Math.max(own, under + HEADER_ASCENT);
}

/**
 * How far a header whose name would sit on `own` has to drop — for a round
 * whose top is a **block** rather than a row or two: THE PULSE hangs its
 * name, its meter, its tally and the top of its lanes off one another, and a
 * row moved on its own lands on the next. The block moves by this, as one.
 */
export function headerLift(view: ViewState, own: number): number {
  return headerTop(view, own) - own;
}

/**
 * The name's ascent plus a breath. Every round opens its header with a 16px
 * bold name, and a baseline this far under the plate's foot puts the tops of
 * its capitals just clear of the slime hanging off the plate.
 */
const HEADER_ASCENT = 20;
