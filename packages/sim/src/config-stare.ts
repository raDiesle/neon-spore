/**
 * THE STARE's numbers — the lead-in, how many live passes a level gets, how
 * long the charge gives the lid, and the two endings (`stare.ts`,
 * `docs/spec/bosses.md`).
 *
 * Its own file for the reason `config-claw.ts` and `config-scout.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.starePasses`.
 *
 * The rhythm itself is not here. It is authored, one pattern a level, on the
 * wave (`StareEntry.levels`), because the owner asked for levels a pair learns
 * — and a pattern is a thing you learn, where a number is a thing you tune.
 */
export interface StareConfig {
  /**
   * Beats of shut, harmless eye before a pattern begins — at the top of the
   * fight, between a vent and the next pass, after a hit and after a level
   * starts again. 2 is one breath: *here it comes*.
   */
  stareRestBeats: number;
  /**
   * Live passes a level gets before it starts again from its blue pass. The
   * owner, 29 September 2026: *it repeats 3 times to give players time to
   * shoot and hit once*.
   */
  starePasses: number;
  /**
   * Beats the charge runs before the beam falls, under THE SLOW. 5 is longer
   * than a spoken *pull it* and short enough that the eye is seen winning.
   */
  stareChargeBeats: number;
  /**
   * How far down the lid has to come to vent the charge, in thousandths of a
   * tile. 600 is most of a thumb's travel over the eye.
   */
  stareLidPullMilli: number;
  /** Beats the eye reels after a hit before the next level's lead-in. */
  stareHurtBeats: number;
  /** Beats the last hit takes to put the eye out, before the wave is won. */
  stareDyingBeats: number;
}

/**
 * What the game ships with. The charge was sized against the latency page's
 * spoken exchange (2.1–3.6 s): five beats is 3.1 s at 96 bpm before THE SLOW
 * stretches it, so a pair that says *pull* on the first beat has the lid down
 * with room to spare.
 */
export const STARE_DEFAULTS: StareConfig = {
  stareRestBeats: 2,
  starePasses: 3,
  stareChargeBeats: 5,
  stareLidPullMilli: 600,
  stareHurtBeats: 3,
  stareDyingBeats: 4,
};
