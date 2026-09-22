/**
 * THE HASP's tuning: how long a grip lasts before it burns the hand off,
 * how long the burn holds, how far a wheel has to be wound to open a hasp,
 * and how long the bolt has before it reaches the hull.
 *
 * What is **not** here is the number of hasps: three sealed clasps down the
 * centre line is the silhouette and not a tuning, and it lives with the
 * picture it is (`hasp.ts`, `HASP_COUNT`). Nor is anything about *whose*
 * hand is whose — the latch is the pilot's and the wheel the navigator's,
 * always, and that is said once in `hasp-hand.ts`.
 */
export interface HaspConfig {
  /** How far the latch travels under a thumb, in thousandths — the depth a drag is cut to. */
  haspReachMilli: number;
  /**
   * How deep the latch counts as **gripped**, in thousandths of the reach.
   *
   * Two thirds, `bellowsWorkMilli`'s figure and its argument: a thumb that
   * brushes the latch has not taken it, and a thumb that means to has no
   * doubt. Unlike that one this is a **level** rather than an edge — the
   * whole gesture is *keep holding*, so what the wheel asks every tick is
   * whether the hand is down now, not whether it crossed something once.
   */
  haspGripMilli: number;
  /** Beats the row hangs sealed before the first latch lights. */
  haspStillBeats: number;
  /**
   * Beats one grip lasts before the latch burns the hand off it — the
   * pilot's whole clock, and the only thing he is ever shown about it is his
   * own hand's colour coming up (`haspHeatMilli`).
   */
  haspHoldBeats: number;
  /** Beats a grip lasts on the last hasp, where the design shortens the fuse. */
  haspLastHoldBeats: number;
  /** Beats the latch stays too hot to take after it has burned a hand off. */
  haspBurnBeats: number;
  /**
   * How far the wheel has to be wound to open the **first** hasp, in
   * thousandths of a turn — a little under one full turn of a thumb.
   */
  haspWindMilli: number;
  /**
   * How much further each hasp after the first asks for.
   *
   * This is row 5: *the wheel needs more turn than one grip's heat allows*.
   * The second hasp cannot be opened inside a single grip, so the pilot has
   * to let go and take hold again mid-wind while she keeps turning, and the
   * gap between his two grips is the thing they have to talk about.
   */
  haspWindStepMilli: number;
  /** Beats a hasp takes swinging open before the next latch lights. */
  haspSwingBeats: number;
  /** Beats the field runs at a third rate when a burn takes the wheel mid-wind (THE SLOW). */
  haspSlowBeats: number;
  /** Beats the loose bolt has before it reaches the hull. */
  haspBoltBeats: number;
  /** Beats the open row hangs across the field before the wave may end. */
  haspClearBeats: number;
}

export const HASP_DEFAULTS: HaspConfig = {
  haspReachMilli: 1000,
  haspGripMilli: 660,
  haspStillBeats: 2,
  haspHoldBeats: 6,
  haspLastHoldBeats: 4,
  haspBurnBeats: 2,
  haspWindMilli: 800,
  haspWindStepMilli: 400,
  haspSwingBeats: 3,
  haspSlowBeats: 2,
  haspBoltBeats: 4,
  haspClearBeats: 3,
};
