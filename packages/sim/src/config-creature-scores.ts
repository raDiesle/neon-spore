/**
 * What one *creature* pays and what one costs: the lure's price to the hull,
 * and the score for a throb hit, a shell piece, an opened clasp, a veil, a
 * wisp, an echo body, a shed rind layer and a lid.
 *
 * **Its own file rather than more rows next door**, and the seam is the one
 * `config-gyre.ts` and `config-ghost.ts` argue for from the other side: they
 * left because one creature had grown a section of its own, and these leave
 * because they were never about one creature at all. A price is argued
 * *against the other prices* — `scoreVeilKill`, `scoreGhostKill` and
 * `scoreLidKill` carry the same figure on purpose, and the sentence saying so
 * only makes sense with all three in view — while a clock is argued against
 * the beat and the length of a spoken exchange. Two questions, read at
 * different times, and `config-creatures.ts` sat exactly on its limit holding
 * both, so a field could not be added and a comment could not gain a line.
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-shot.ts` and `config-boss.ts` already give: every call site still
 * reads `cfg.scoreWispKill`, and the split is only about how much of one file
 * a reader has to hold at once.
 *
 * `damageCreature` and `scoreDestroy` stay in `config.ts`: they are what an
 * *ordinary* body pays and costs, which is the figure every number here is
 * argued against, and the whole game reads them rather than one creature.
 */
export interface CreatureScoreConfig {
  /** What a shot at a lure costs the hull. Not the score: two currencies for
   * one mistake reads as bookkeeping, and the hull is the one the pair feels.
   * Above `damageCreature` on purpose — a body that reached the hull cost a
   * shot nobody fired, and this cost one that was. */
  damageLure: number;
  /** Score for hitting a Throb with the colour its round half is in. */
  scoreThrobHit: number;
  /** What one piece of THE SHELL is worth. Smaller than a kill: chipping the
   * armour is work either colour can do, and the kill is still to come. */
  scoreShellPiece: number;
  /**
   * Opening a clasp with the ward. Between `scoreDestroy` and `scoreDeflect`:
   * the same joint shape as a deflection, but it only sets the kill up.
   */
  scoreClaspBreak: number;
  /** What a veil is worth. Above `scoreThrobHit`: the timing is only half of
   * it, and the other half is a sentence that had to be said in time. */
  scoreVeilKill: number;
  /** What a wisp is worth. The highest single body in the game: it is only
   * ever killed by a tile that crossed the room, and the pair has one dwell
   * to say it, hear it, aim and fire. */
  scoreWispKill: number;
  /**
   * What *one* echo body is worth. `echoStruck` multiplies it by how many
   * bodies the one it killed would still have become, so a whole arrival pays
   * the same however it is taken and the pair is never paid for letting one
   * divide.
   *
   * Eight bodies at twenty-five is two ordinary kills for one arrival, and
   * that is right rather than generous: an echo is on the field for eighteen
   * beats and spends all of them asking the pair for an order.
   */
  scoreEchoKill: number;
  /**
   * What taking one layer off a rind is worth. Half of `scoreDestroy`, so a
   * whole arrival pays two hundred for three shots — more than the hundred a
   * slick pays for one, and less than the three hundred three slicks would.
   *
   * Deliberately not nothing. The shed is the moment this creature exists for:
   * the pair has to say *again* out loud and keep a column they had finished
   * with, and a mechanic that paid only at the end would teach them that the
   * first two shots were a tax rather than the fight.
   */
  scoreRindShed: number;
  /**
   * What a lid is worth. `scoreVeilKill`'s and `scoreGhostKill`'s figure, and
   * for their reason: all three are bodies the pair can only reach by doing
   * one thing together at one moment, and pricing one above the others would
   * teach that one kind of agreement is worth more than another.
   */
  scoreLidKill: number;
  /**
   * What a magnet is worth. `scoreVeilKill`'s figure, and for its reason with
   * one more turn on it: it is another body the pair can only reach by doing
   * one thing together at one moment, and this one costs the pilot the habit
   * of standing under what they are shooting as well.
   */
  scoreMagnetKill: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CREATURE_SCORE_DEFAULTS: CreatureScoreConfig = {
  damageLure: 15,
  scoreThrobHit: 200,
  scoreShellPiece: 120,
  scoreClaspBreak: 120,
  scoreVeilKill: 250,
  scoreWispKill: 300,
  scoreEchoKill: 25,
  scoreRindShed: 50,
  scoreLidKill: 250,
  scoreMagnetKill: 250,
};
