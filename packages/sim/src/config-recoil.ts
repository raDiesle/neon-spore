/**
 * THE RECOIL's numbers: how many times a shot fails to kill it, how far each
 * failure throws it back up the field, and what one of those is worth
 * (`recoil.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-ghost.ts` and `config-gyre.ts` already give: every call site still
 * reads `cfg.recoilBounces`, and the split is only about how much of one file
 * a reader has to hold at once.
 *
 * **Its own file rather than three more rows in `config-creatures.ts`**, which
 * was one line under its limit before this creature existed. THE GHOST's row
 * next door draws the line at six numbers, and three is plainly not six — so
 * the argument here is the other one that file makes: these three are argued
 * **together**. A count of bounces, the distance one throws the body and the
 * price of one are a single decision about how long this creature holds a
 * column, and a reader who moves one has to move the other two. Everything
 * left next door is argued one number at a time.
 */
export interface RecoilConfig {
  /**
   * How many times THE RECOIL survives a matching shot before one kills it.
   * Three, so one arrival is four shots — and the number is the creature
   * rather than a tuning: at one the cage is a flinch the pair forgets, and at
   * five the column is held so long that the wave around it stops being the
   * thing they are playing. Three is the smallest count that makes *again*
   * something they have to say until they are tired of saying it.
   */
  recoilBounces: number;
  /**
   * Rows a bounce throws it back up the field. Two, which is
   * `docs/tower-defence.md`'s own figure for this row and right for the reason
   * that page gives: one row is a stagger and reads as the body flinching in
   * place, three puts it back where it entered and reads as the shot having
   * done nothing at all. Two plainly *undoes* two beats of falling, and two
   * beats is about what the pair spends agreeing a column.
   */
  recoilRows: number;
  /**
   * What one bounce is worth. Above `scoreRindShed` and below `scoreDestroy`,
   * and the ordering is the argument: a shed costs the pair a repeat of the
   * same call, and a bounce costs them the colour and the lane as well. It is
   * deliberately not nothing, for `scoreRindShed`'s reason — a mechanic that
   * paid only at the end would teach the pair that the first three shots were
   * a tax rather than the fight.
   */
  scoreRecoilBounce: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const RECOIL_DEFAULTS: RecoilConfig = {
  recoilBounces: 3,
  recoilRows: 2,
  scoreRecoilBounce: 60,
};
