/**
 * Whose hand may knock a blister down: player 1, player 2, or either, whose
 * blows then go on the one count (`docs/spec/blister.md`, *BY*).
 */
export type BlisterBy = 1 | 2 | "both";

/**
 * **THE BLISTER's four fields**: whose blow counts, how many are still owed,
 * whether it is up, and how long it stays where it is.
 *
 * Its own file for `creature-state-mine.ts`' reason — `creature-state.ts` is
 * at its limit — and along the same seam: none of these is written while a
 * body falls, because a blister never does. `CreatureState extends
 * BlisterState`, so every call site reads `c.blisterLeft`.
 */
export interface BlisterState {
  /**
   * The seat whose blow counts, and absent on every other kind. The wave
   * chooses it (`SpawnEntry.by`), as it chooses a mine's seat, and the
   * other seat is the one shown the pore swelling — so turning it over turns
   * the whole exchange round.
   */
  blisterBy?: BlisterBy;
  /**
   * Blows still owed. **Kept across surfacings**, and that is the mole: a tap
   * that lands while it is up is one off, nothing grows back while it is
   * under, and at nought it is gone.
   */
  blisterLeft?: number;
  /** Whether it is up now — the only beats a blow counts on, and the only
   * beats a bolt meets it. */
  blisterUp?: boolean;
  /**
   * Beats left in the phase it is in, up or under. A countdown on the body
   * rather than a beat read off `world.beat`, for `mineFuse`'s reason: two
   * blisters on one field surface on their own clocks.
   */
  blisterClock?: number;
}
