/**
 * THE MALFUNCTION's four numbers: how often a broken control acts by itself,
 * and what the other seat's relief is worth.
 *
 * Its own file, the way every mechanic with numbers of its own has one. The
 * seam is the same one `config-fence.ts` and `config-recoil.ts` were cut
 * along: `config.ts` holds what the *ship* is — the hull, the grid, the beat —
 * and a rule that only exists while one particular thing is on the panel holds
 * its own figures beside it.
 *
 * Every one of them is in **beats** rather than milliseconds, and that is the
 * decision this file is really making. A window nobody counts is measured in
 * time (`guardWindowMs`, `intakeWindowMs`); a window the pair has to *plan a
 * crossing inside of* is measured in the thing they are already counting out
 * loud. "Two beats" is a sentence one of them can say to the other. "Twelve
 * hundred milliseconds" is not.
 */
export interface MalfunctionConfig {
  /**
   * Beats between two automatic actions of a broken control.
   *
   * One, and the whole feel of the mechanic is in that number: the fault does
   * exactly what the metronome does, so the pair already knows when the next
   * one is coming. A fault that fired on some other clock would be a thing to
   * watch rather than a thing to count, and watching is what this game spends
   * its attention on elsewhere.
   */
  malfunctionEveryBeats: number;
  /**
   * How long one tap of the relief holds the fault off.
   *
   * Two beats is one crossing and not two. It is deliberately shorter than
   * `reliefRestBeats` below, so a seat cannot simply hold the fault down for
   * the whole wave by tapping on a rhythm — the quiet is a window somebody
   * asked for out loud, and there is a gap between windows whatever they do.
   */
  reliefPauseBeats: number;
  /**
   * Beats from one relief press to the next one that is answered.
   *
   * Measured from the **press** and not from the end of the pause, so the
   * whole cycle is one number the pair can count rather than two they have to
   * add up. Six against a pause of two means a third of the wave is quiet and
   * two thirds are not, which is what makes the call worth making at the right
   * moment instead of at the first moment.
   */
  reliefRestBeats: number;
}

export const MALFUNCTION_DEFAULTS: MalfunctionConfig = {
  malfunctionEveryBeats: 1,
  reliefPauseBeats: 2,
  reliefRestBeats: 6,
};
