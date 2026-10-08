/**
 * **THE BLISTER's one**: a blow that counted.
 *
 * Its own file for `events-strand.ts`' reason — `events-creature.ts` is at its
 * limit — and one event rather than two, because a blow that did not count is
 * nothing: a tap from the wrong seat or on a sunk pore costs nothing and says
 * nothing (`blisterTapped`; the late tap is its own punishment,
 * `docs/spec/blister.md`). The last blow is followed by a plain `destroy` on
 * the same tick, which is the body going.
 */
export type BlisterEvent = {
  type: "blisterBlow";
  /** The body, for `beatboxTap`'s reason: render rings it where it is drawn
   * this frame, which is the pore it came up out of, rising or sinking. */
  id: number;
  col: number;
  row: number;
  /** Blows still owed after this one; nought on the blow that finished it.
   * No secret — the seat with the hand counts them off its own pips, and the
   * other seat is told nothing it could not hear across the table. */
  left: number;
};
