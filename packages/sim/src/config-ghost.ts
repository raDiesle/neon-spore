/**
 * THE GHOST's numbers: what one is worth, the row a crossing one prowls along,
 * how far it goes each beat, how long its temper lasts and what it costs the
 * hull when it runs out (`ghost.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-gyre.ts` and `config-pinball.ts` already give: every call site still
 * reads `cfg.ghostCrossCols`, and the split is only about how much of one file
 * a reader has to hold at once.
 *
 * **Its own file rather than six more rows in `config-creatures.ts`**, which
 * went past its limit the day THE LID added two. That file is the bestiary's
 * shared one — a creature or two numbers each, argued about a creature at a
 * time — and this creature has six, which is the second most of any body in
 * the game. THE GYRE made exactly this argument first and took seven with it:
 * six of anything in a shared list has stopped being a row and become a
 * section, and a section is a file.
 *
 * They are also the one group here that is not about a *clock*. Everything
 * left next door is how long something lasts or what it pays; four of these
 * six are a **route** — which row, how many columns, how many walls, how fast
 * the dive — and a route is the only thing in this game a creature decides for
 * itself rather than being handed by the beat.
 */
export interface GhostConfig {
  /**
   * What a ghost is worth. The veil's figure exactly, and that is the point
   * rather than a coincidence: both are a body the pair can only reach by
   * saying one thing out loud in time, and a pair that learned one of them
   * priced above the other would be learning that one sentence is worth more
   * than the other. The sentence is the same size — a colour and a number.
   */
  scoreGhostKill: number;
  /**
   * The row a crossing ghost prowls along. Three: far enough down that it is
   * drawn at a size player 2 can actually read a column off, far enough up
   * that the dive at the end of its temper is a fall the pair watches rather
   * than an arrival.
   */
  ghostCrossRow: number;
  /**
   * Columns a crossing ghost takes each beat.
   *
   * Two, and the number is set by the *length of the crossing* rather than by
   * how fast the body should look. The field is thirteen columns wide, so at
   * one a crossing is twelve beats and three of them are twenty-two seconds —
   * a whole wave spent on one arrival. At two it is six beats out and one
   * standing at the wall, which is about a spoken exchange, and three of them
   * fit inside a wave that has other things in it.
   *
   * It also makes the call expire properly: two lanes a beat is more than a
   * cannon slides comfortably in one, so the column player 2 says has to be
   * where it is *going*, which is the sentence this path exists to demand.
   */
  ghostCrossCols: number;
  /**
   * Walls a crossing ghost turns at before it gives up and dives. Three,
   * because it is a number the pair counts out loud while doing something
   * else, and two is over before the counting has started.
   */
  ghostChargeLaps: number;
  /** Tiles a charging ghost falls each beat. `meteorFast`'s three: fast enough
   * to read as a decision and slow enough to still be shot on the way down. */
  ghostDiveTiles: number;
  /**
   * What a charging ghost costs the hull. Above `damageCreature` and below
   * `damageMeteor`: it is the one arrival that *aimed* at the ship, so it is
   * worse than a body that merely arrived — and it was answerable for three
   * whole crossings, which a rock never is.
   */
  damageGhostDive: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const GHOST_DEFAULTS: GhostConfig = {
  scoreGhostKill: 250,
  ghostCrossRow: 3,
  ghostCrossCols: 2,
  ghostChargeLaps: 3,
  ghostDiveTiles: 3,
  damageGhostDive: 18,
};
