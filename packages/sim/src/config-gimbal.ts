/**
 * THE GIMBAL's tuning: how close together two hands must let go, how much of
 * a turn of the outer ring the inner rides, and how fast a ring nobody is
 * holding falls back.
 *
 * What is **not** here is where any mark sits, how far it creeps or how near
 * is near enough: those are the wave's, authored as six alignments
 * (`packages/content/src/gimbal-script.ts`), so two waves may hang the same
 * drum with different turns in it. And there is no figure for which way round
 * the navigator's ring is drawn, because that is not a figure — it is the
 * geometry, and `gimbalShownMilli` is where it is said once.
 */
export interface GimbalConfig {
  /**
   * Ticks the second hand has, after the first lets go of a true pair, to let
   * go too. **A quarter of a second**: wide enough for *three, two, one, now*
   * said in one room to land in both thumbs, narrow enough that two people
   * letting go whenever they feel like it never do it together.
   */
  gimbalLetGoTicks: number;
  /** How much of a turn of the outer ring the inner rides, in hundredths. A
   * hundred is a real gimbal: the inner is hung in the outer and goes with it. */
  gimbalCarryPct: number;
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
  gimbalLetGoTicks: 30,
  gimbalCarryPct: 100,
  gimbalDriftMilli: 60,
  gimbalStillBeats: 2,
  gimbalShearBeats: 3,
  gimbalSlowBeats: 2,
  gimbalSeamBeats: 4,
  gimbalOpenBeats: 3,
};
