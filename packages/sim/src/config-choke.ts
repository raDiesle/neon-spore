/**
 * THE CHOKE's one number: how fast the steer fault walks the cannon while
 * it has it (`malfunction.ts`). It had three when THE CHOKE was a body —
 * the taps that got it off and what getting it off was worth went with the
 * body on 12 September 2026 (`docs/decisions.md` #31).
 *
 * `SimConfig` extends this rather than nesting it, for `config-gum.ts`'
 * reason next door: the call site still reads `cfg.chokeSweepBeats`, and the
 * split is only about how much of one file a reader has to hold at once.
 */
export interface ChokeConfig {
  /**
   * Beats between the cannon's steps while the steer fault has it. One: at
   * the default tempo that is a wall-to-wall sweep in six seconds, slow enough
   * that player 2 can time a shot to a column the cannon is about to cross
   * and fast enough that nothing stays under the muzzle for long.
   */
  chokeSweepBeats: number;
}

export const CHOKE_DEFAULTS: ChokeConfig = {
  chokeSweepBeats: 1,
};
