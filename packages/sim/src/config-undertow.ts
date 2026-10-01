/**
 * THE UNDERTOW's numbers — how long each of its three levels lasts, how many
 * lobes each lets up at once, how long a lobe bows, stands and grows, and how
 * long the end of a level takes to draw every lobe back in (`undertow.ts`,
 * `docs/spec/bosses-choreographed.md` §13).
 *
 * Its own file for `config-baton.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.undertowBowBeats`, and the
 * split is about how much of one file a reader has to hold at once.
 *
 * **Every beat here is a call's worth of time.** A bow is player 1 seeing the
 * floor lift and saying the column and the colour; a stand is the pair moving
 * the right control under it. At the boss's 96 bpm eight beats is five
 * seconds, which is the owner's figure for both the stand and the tall
 * (1 October 2026).
 */
export interface UndertowConfig {
  /** Beats each level lasts. The pair survives it; they need not take every lobe. */
  undertowLevelBeats: number;
  /** Lobes up at once in the first level. */
  undertowOneLobes: number;
  /** Lobes up at once in the second level. */
  undertowTwoLobes: number;
  /** Lobes up at once in the third level. */
  undertowThreeLobes: number;
  /** Beats a plate bows before the lobe stands up through it. */
  undertowBowBeats: number;
  /** Beats a lobe stands, answerable, before it grows tall. */
  undertowStandBeats: number;
  /** Beats a tall lobe stands untapped before it bursts and the wave is lost. */
  undertowTallBeats: number;
  /** Beats of empty floor at the start of a level before the first bow. */
  undertowRestBeats: number;
  /** Beats every lobe takes to shrink back into the floor when a level's clock runs out. */
  undertowEbbBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one level: thirty seconds at 96 bpm, a lobe bowing for four beats
 * and standing for eight, so a pair that answers nothing meets the first
 * burst twenty beats in — well inside the clock, which is the point.
 */
export const UNDERTOW_DEFAULTS: UndertowConfig = {
  undertowLevelBeats: 48,
  undertowOneLobes: 1,
  undertowTwoLobes: 2,
  undertowThreeLobes: 3,
  undertowBowBeats: 4,
  undertowStandBeats: 8,
  undertowTallBeats: 8,
  undertowRestBeats: 2,
  undertowEbbBeats: 4,
};
