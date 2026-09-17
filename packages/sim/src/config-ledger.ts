/**
 * THE LEDGER's numbers — how wide the body stands, how many hits part it, how
 * long a return takes to come down the cord and how short that gets, how long
 * the cord takes to root, when a warded return starts being the weapon, how
 * far the socket walks with each one, and how long the halves take to part
 * (`ledger.ts`, `docs/spec/bosses-choreographed.md` §5).
 *
 * Its own file for `config-taster.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.ledgerCadenceBeats`.
 *
 * **The cadence is the only number here the pair ever says out loud**, and it
 * is the fight: four beats is long enough to carry the shield across the hull
 * and say which column it is going to, and two is the same sentence with the
 * time for it taken away. Nothing else in the game has ever asked the pair to
 * answer something they caused, so the number they are answering has to be
 * one they can hear themselves start.
 */
export interface LedgerConfig {
  /** Columns the body covers; the seam is the middle one of them. */
  ledgerCols: number;
  /** Hits down the seam that part the two halves. */
  ledgerSeamHits: number;
  /**
   * Beats a return takes down the cord with nothing yet down the seam — one
   * beat less for every hit that has landed (`ledgerCadence`), so the first
   * return the pair ever answers is one beat shorter than this.
   */
  ledgerCadenceBeats: number;
  /** What that shortens to, one beat per hit, and no further. */
  ledgerCadenceMinBeats: number;
  /** Beats the cord takes to pay out and root before the body can be hit. */
  ledgerRootBeats: number;
  /** Hits after which the cord bills every shot, and a warded return whips. */
  ledgerWhipSeam: number;
  /** Columns the root slides along the hull with every return that lands. */
  ledgerSocketStep: number;
  /** Beats THE SLOW holds as a return takes its last beat down the cord. */
  ledgerSlowBeats: number;
  /** Beats the halves take to part once the cord has torn out. */
  ledgerOutBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: the cord roots over two beats, the seam takes five hits
 * to part, and the first return comes down four beats behind the shot that
 * made it — three behind the second, two from the third onward, which is the
 * floor and where the last three of the five are answered. From the second hit the cord bills **everything** the cannon does and
 * a warded return is thrown back up it, so the last three hits can be made
 * without firing at the body at all. The root walks one column per return.
 */
export const LEDGER_DEFAULTS: LedgerConfig = {
  ledgerCols: 3,
  ledgerSeamHits: 5,
  ledgerCadenceBeats: 5,
  ledgerCadenceMinBeats: 2,
  ledgerRootBeats: 2,
  ledgerWhipSeam: 2,
  ledgerSocketStep: 1,
  ledgerSlowBeats: 1,
  ledgerOutBeats: 3,
};
