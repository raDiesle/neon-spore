/**
 * **THE FENCE's two fields**, and both of them are sets of columns: the ways
 * through the wave authored, and the ways through the cannon has cut.
 *
 * Its own file rather than two more entries in `creature-state.ts`, and for
 * `creature-state-veer.ts`'s reason: that file was at its 250-line limit the
 * day the second mask was added. The better reason is the one that file gives
 * too — these two only mean anything against each other. `fenceIsOpen` is
 * their union and `fenceGapSeen` is the difference between them, and neither
 * question can be asked of one alone.
 *
 * `CreatureState extends FenceState`, so every call site still reads
 * `c.fenceGaps` and nothing moved.
 */
export interface FenceState {
  /**
   * THE FENCE's one field: which columns the wall is open in, as a bitmask —
   * bit `k` set means column `k` lets the dome through. Absent on every other
   * kind, and never absent on a wall, because a wall with no way through is
   * not a creature (`fenceMask`).
   *
   * A mask and not a list of columns, for `Creature.shell`'s reason: it is a
   * set, two devices have to agree about it exactly, and an integer is the
   * shape the fingerprint already takes. Read it through `fenceIsOpen` and
   * `fenceGapCols` (`fence.ts`) and never by shifting here — the break render
   * draws and the column the shield is tested against are one fact, and a
   * second spelling is how the pair comes to be shown a way through the ship
   * has not got.
   */
  fenceGaps?: number;
  /**
   * And the columns the **cannon** has cut in it, on the same terms. Absent
   * until a bolt reaches the wire; never cleared, because a fence is not
   * repaired.
   *
   * Its own field beside `fenceGaps` rather than folded into it, and the
   * separation is the creature rather than bookkeeping: an authored gap is a
   * secret one seat holds and a burnt one is a thing both of them watched
   * happen, so a single mask could not answer what either screen draws.
   * `fenceGapSeen` is where that split is written down, and `fenceIsOpen` is
   * the union the shield is tested against.
   */
  fenceBurns?: number;
}
