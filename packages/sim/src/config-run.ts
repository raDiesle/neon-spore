/**
 * The run's own numbers: the rest after a wave, the pause after a hit, and
 * the switch that lets a wave be watched through its hits.
 *
 * `SimConfig` extends this rather than nesting it, for the reason every
 * `config-*.ts` gives: every call site still reads `cfg.waveRestBeats`, and
 * the split is only about how much of one file a reader has to hold at once
 * — `config.ts` was on its 250th line when `waveFailBeats` needed a home.
 */
export interface RunConfig {
  /**
   * Beats between a wave being cleared and the next one starting.
   *
   * **Six, and it was three while nothing was drawn over it.** Three beats is
   * 1.9 seconds at 96 bpm, which is long enough for a field to settle and not
   * long enough to read two lines in — and the rest carries a screen now: the
   * wave just cleared, the clock and the retries (`render/src/cleared.ts`,
   * `docs/spec/between-waves.md`). Six is 3.75, against the introduction's 5.5
   * for three lines nobody has seen before.
   *
   * The run's clock does not run through it (`countPlay`, `wave-fail.ts`), so
   * a longer rest does not inflate the figure the screen is reporting.
   */
  waveRestBeats: number;
  /**
   * Beats the field stands still after a hit before the same wave opens
   * again. The owner's rule of 12 September 2026: any damage to the hull
   * fails the wave, and the wave is played again until it is cleared clean
   * (`wave-fail.ts`). Two beats — long enough for the breach to be seen where
   * it happened, short enough that a lost wave costs the pair little more
   * than the time they had spent on it, which is what the run's clock counts.
   */
  waveFailBeats: number;
  /**
   * A hit costs nothing: the breach is shown and the wave plays on. A
   * watching convenience — the director plays every wave to its end under it
   * — and a config field rather than a flag in the app because a replay has
   * to record that the run was played this way.
   */
  hullInvulnerable: boolean;
  /**
   * A shot that meets nothing and flies out of the top of the field loses the
   * wave, as a hit on the hull does. HARD's rule, and the only rule a level
   * changes (`difficulty.ts`, `shot-out.ts`); off everywhere else, and off in
   * every film, which is a rehearsal and not the pair's play.
   */
  wastedShotFails: boolean;
}

export const RUN_DEFAULTS: RunConfig = {
  waveRestBeats: 6,
  waveFailBeats: 2,
  hullInvulnerable: false,
  wastedShotFails: false,
};
