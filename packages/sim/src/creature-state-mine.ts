/**
 * **THE MINE's two fields**, a count and a seat, and between them they are the
 * whole of a body that never moves.
 *
 * Its own file rather than two more entries in `creature-state.ts`, which THE
 * MOULT's own field took past the 250-line limit — the immediate reason, and
 * the same one `creature-state-veer.ts` and `creature-state-strand.ts` each
 * record for themselves. The seam is a real one as well: every other group cut
 * out of that file is state a body writes *while it falls*, and neither of
 * these is. One is a clock that runs whether anybody touches the body or not,
 * and the other is not about the body at all — it is about which screen the
 * body is on, which is the only field in the whole of `CreatureState` that
 * says something about a **player** rather than about a thing on the field.
 *
 * `CreatureState extends MineState`, so every call site still reads
 * `c.mineFuse` and nothing moved.
 */
export interface MineState {
  /**
   * Beats left on THE MINE's fuse, and absent on every other kind. It counts
   * **down**, one a beat, and a wrong tap that was not a neighbour takes
   * another off it (`mine.ts`); at nought the mine goes off and the ship pays
   * for it.
   *
   * A countdown rather than the beat it was laid on, which is the opposite of
   * `veilStruckTick`'s arrangement and deliberately so: this number is drawn
   * on **both** screens and is the one thing a blind seat has, so it has to be
   * the same number in the fingerprint as on the dial. A moment plus a length
   * would make the two screens agree only as long as they agreed about the
   * length, and a tap takes a beat off the length.
   */
  mineFuse?: number;
  /**
   * Which seat this mine is **drawn on**, and absent on every other kind. The
   * wave chooses it (`SpawnEntry.sees`), so one wave may give the sight to the
   * navigator and the blind tap to the pilot and the next may swap them.
   *
   * On the body rather than on the world, because two mines on one field may
   * be set opposite ways round — which is the sharpest thing this creature can
   * be asked to do, and the reason the setting is a wave's at all rather than
   * a rule in this package (`docs/queue.md`, 15 September 2026).
   */
  mineSees?: 1 | 2;
}
