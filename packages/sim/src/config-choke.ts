/**
 * THE CHOKE's numbers: how many taps get it off the cannon, how fast it
 * drags the cannon while it has it, and what getting it off is worth
 * (`choke.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for `config-gum.ts`'
 * reason next door: every call site still reads `cfg.chokeTaps`, and the
 * split is only about how much of one file a reader has to hold at once.
 */
export interface ChokeConfig {
  /**
   * How many **fresh** presses on the dead cannon strip it takes to get the
   * choke off — a lift between each, so a thumb held down counts once. The
   * owner's figure was a time and not a count: a pair that is quick about it
   * should still be without the cannon for five seconds or more. A thumb
   * tapping as fast as a thumb goes lands six or so a second, and thirty-two
   * of those is five and a half seconds; a pair that is slower is without it
   * for longer, which is the cost the wave is about.
   */
  chokeTaps: number;
  /**
   * Beats between the cannon's steps while the choke has it. One: at the
   * default tempo that is a wall-to-wall sweep in six seconds, slow enough
   * that player 2 can time a shot to a column the cannon is about to cross
   * and fast enough that nothing stays under the muzzle for long.
   */
  chokeSweepBeats: number;
  /**
   * What getting it off is worth. `scoreGumFlung`'s figure: like a gum it is
   * a body answered without a shot, and it took two seats to survive — one
   * tapping, the other firing from a cannon neither of them was steering.
   */
  scoreChokeFreed: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CHOKE_DEFAULTS: ChokeConfig = {
  chokeTaps: 32,
  chokeSweepBeats: 1,
  scoreChokeFreed: 150,
};
