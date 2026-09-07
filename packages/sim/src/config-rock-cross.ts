/**
 * **A crossing rock's one number**: how far along its row it goes each beat
 * (`rock-cross.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-ghost.ts` and `config-carom.ts` already give: every call site still
 * reads `cfg.rockCrossCols`, and the split is only about how much of one file
 * a reader has to hold at once.
 *
 * **Its own file rather than two more rows in `config-creatures.ts`**, which
 * has been over its limit since THE LID. These two are also not about a
 * creature at all: a crossing rock is not a kind in the bestiary, it is a
 * *path* any plain rock may be authored onto (`WaveEntry.cross`), so a pair of
 * rows filed under a creature's name would be filed under a creature that does
 * not exist.
 *
 * It had a second beside it — how far the body sank at each wall it turned at
 * — and both went when the owner asked for a rock that leaves the field at the
 * far side rather than turning and working its way down. There is no turn any
 * more, so there is nothing to sink at; what is left is the one number that
 * decides how long the crossing lasts, which is the whole of the window the
 * pair has.
 */
export interface RockCrossConfig {
  /**
   * Columns a crossing rock takes each beat. Two, which is THE GHOST's stride
   * and taken from it deliberately: both are a body walking a row while the
   * pair says a number out loud, and two lanes a beat is more than a shield
   * slides comfortably in one — so the column player 1 calls has to be where
   * the rock is *going* rather than where it is.
   *
   * One would make a single crossing a wave of its own — eleven columns is
   * eleven beats, seven seconds of one rock; three is THE CAROM's lead, and a
   * lead is a different sentence from a lane. At two a crossing is six beats,
   * which is about the length of one spoken exchange.
   */
  rockCrossCols: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const ROCK_CROSS_DEFAULTS: RockCrossConfig = {
  rockCrossCols: 2,
};
