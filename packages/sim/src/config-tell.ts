/**
 * THE TELL's numbers, which are two: what a lost rung costs and what running
 * the ladder's clock out costs (`tell.ts`, `docs/spec/bosses.md` 11.9).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-gauge.ts` and `config-pulse.ts` already give: every call site still
 * reads `cfg.damageTell`, and the split is about how much of one file a reader
 * has to hold at once.
 *
 * **Everything else about the round is authored**, which is why this file is
 * the shortest of the round configs. How long a window is, whether the boss
 * feints, and whether it answers the pair's last throw are all per rung and
 * all on the page in `content` — a ladder whose difficulty was a number here
 * would be a ladder nobody could read.
 */
export interface TellConfig {
  /**
   * What the hull pays when the ladder's clock runs out with rungs left.
   *
   * THE GAUGE's twenty, the number every round since has taken for the same
   * event — a round the pair did not finish — and defended no further.
   */
  damageTell: number;
  /**
   * What one lost rung costs.
   *
   * `damageSnakeRepeat`'s eight, for `damageSnakeRepeat`'s reason and it is
   * the number with the least behind it: starting over has to cost enough that
   * the ladder is real and little enough that the round is not over at the
   * first mistake. The owner's to turn once he has lost one.
   */
  damageTellRepeat: number;
}

export const TELL_DEFAULTS: TellConfig = {
  damageTell: 20,
  damageTellRepeat: 8,
};
