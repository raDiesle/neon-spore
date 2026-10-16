/**
 * **THE BLISTER's one**: a blow that counted — the one that knocked it out,
 * or one of several a body takes (`left`).
 *
 * Its own file for `events-strand.ts`' reason — `events-creature.ts` is at its
 * limit — and one event rather than two, because a blow that did not count is
 * nothing: a tap from the wrong seat or on a pore still under costs nothing
 * and says nothing (`blisterTapped`; the late tap is its own punishment,
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
  /** Blows still owed after this one: nought is the body gone with it, more
   * is a blow the body took and stays up after (`blister-numbers.ts`). */
  left: number;
};
