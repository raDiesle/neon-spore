/**
 * THE GIMBAL's tuning: how near a mark is near enough, how long an alignment
 * has to be held, and how fast a ring nobody is holding falls back.
 *
 * What is **not** here is where any mark sits or how far it creeps: those are
 * the wave's, authored as three alignments
 * (`packages/content/src/gimbal-script.ts`), so two waves may hang the same
 * drum with different turns in it. And there is no figure for which way round
 * the navigator's ring is drawn, because that is not a figure — it is the
 * geometry, and `gimbalShownMilli` is where it is said once.
 */
export interface GimbalConfig {
  /** How near its mark a ring must sit to read as true, in thousandths of a turn. */
  gimbalTrueMilli: number;
  /** Beats both rings must sit true together before a tooth pair shears. */
  gimbalHoldBeats: number;
  /** How far a ring with no hand on it falls back toward rest each beat. */
  gimbalDriftMilli: number;
  /** Beats the drum hangs dark between the two dead rings before the first marks light. */
  gimbalStillBeats: number;
  /** Beats a shear takes before the next alignment's marks light. */
  gimbalShearBeats: number;
  /** Beats the field runs at the slow rate on each shear (THE SLOW). */
  gimbalSlowBeats: number;
  /**
   * Beats the leaking seam has before the spark reaches the hull.
   *
   * **Four, and the number is a measurement.** A bolt crosses the field in
   * a little over a beat, so the pair need one beat to hear the leak, one to
   * slide the cannon to the middle from wherever it was, one for the flight
   * and one of margin. Two would be a hazard nobody could answer from the
   * far side of the hull, which is a strike dealt rather than a strike
   * earned.
   */
  gimbalSeamBeats: number;
  /** Beats the opened hatch hangs before the wave may end. */
  gimbalOpenBeats: number;
}

export const GIMBAL_DEFAULTS: GimbalConfig = {
  gimbalTrueMilli: 45,
  gimbalHoldBeats: 2,
  gimbalDriftMilli: 60,
  gimbalStillBeats: 2,
  gimbalShearBeats: 3,
  gimbalSlowBeats: 2,
  gimbalSeamBeats: 4,
  gimbalOpenBeats: 3,
};
