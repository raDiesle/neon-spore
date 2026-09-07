/**
 * **A crossing rock's two numbers**: how far along its row it goes each beat,
 * and how far it sinks at each wall it turns at (`rock-cross.ts`).
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
 * The two are argued together, and they have to be: how many walls one arrival
 * touches before it reaches the ship is the stride and the drop read against
 * each other, exactly as `caromCols` and `caromRows` are.
 */
export interface RockCrossConfig {
  /**
   * Columns a crossing rock takes each beat. Two, which is THE GHOST's stride
   * and taken from it deliberately: both are a body walking a row while the
   * pair says a number out loud, and two lanes a beat is more than a shield
   * slides comfortably in one — so the column player 1 calls has to be where
   * the rock is *going* rather than where it is.
   *
   * One would make a crossing of the shipped field a wave of its own; three is
   * THE CAROM's lead, and a lead is a different sentence from a lane.
   */
  rockCrossCols: number;
  /**
   * Rows it sinks at each wall it turns at. Two, which is THE COIL's drop and
   * taken from it for the same reason the stride is taken from THE GHOST: the
   * wall is the only place a crossing body may sink, or the pair never gets
   * the beats it needs to agree on a column and then stand in it.
   *
   * Two rather than one because a rock authored high has the whole field to
   * work down through, and at one row a wall the pair would be watching the
   * same arrival for the better part of a wave.
   */
  rockCrossDropRows: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const ROCK_CROSS_DEFAULTS: RockCrossConfig = {
  rockCrossCols: 2,
  rockCrossDropRows: 2,
};
