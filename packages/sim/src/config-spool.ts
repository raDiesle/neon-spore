/**
 * THE SPOOL's tuning: how far the brake travels, how fast and how slow the
 * line runs at either end of it, how wide the zone opens and how much it
 * narrows a rib, and how long each leg, each grace and each pause holds.
 *
 * What is **not** here is the number of ribs, nor how many legs a movement
 * runs: four ribs is the silhouette and one-two-three-one is the beat list,
 * and both live with the shape they are (`spool.ts`, `SPOOL_RIBS`,
 * `SPOOL_LEGS`). Nor is anything about *which* seat holds the brake — there
 * is one brake and it is the pilot's, said once in `spool-hand.ts`.
 */
export interface SpoolConfig {
  /** How far the brake travels, in thousandths — the depth a hold is cut to. */
  spoolReachMilli: number;
  /**
   * What the line pays out at with the brake fully shallow, in thousandths of
   * the track a beat. The rate a brake nobody is holding runs at, which is
   * why it is the fast end: letting go is not neutral.
   */
  spoolRateFastMilli: number;
  /** What it pays out at with the brake fully deep, in thousandths a beat. */
  spoolRateSlowMilli: number;
  /**
   * How wide the first movement's zone opens, in thousandths.
   *
   * Wide enough that a pair who has said one sentence to each other is inside
   * it — the first movement teaches the gesture and nothing else — and it is
   * the figure every later zone is cut down from.
   */
  spoolZoneWideMilli: number;
  /** How much narrower the zone is per rib eased, in thousandths. */
  spoolZoneNarrowMilli: number;
  /**
   * Beats a leg runs before the target rate is rolled again.
   *
   * Long, and deliberately (the owner, 22 September 2026: *double the time
   * what players have time to do the action, and let it require some more
   * clicks*): a leg is what the pair talk across, and most of a call goes on
   * finding out whose half of the sentence is whose. The **need** is raised
   * with it in the only unit this fight has — a movement runs one leg, then
   * two, then three (`SPOOL_LEGS`).
   */
  spoolLegBeats: number;
  /**
   * Beats at the head of a movement before the zone is judged at all.
   *
   * The paid-out length and the target start on the same mark, so without
   * this the pair would be outside the zone before either had said a word.
   */
  spoolGraceBeats: number;
  /** Beats the taut spool hangs before the first zone opens. */
  spoolTautBeats: number;
  /** Beats the line hangs slipped before the movement runs again. */
  spoolSlipBeats: number;
  /** Beats a rib takes easing open before the next zone opens. */
  spoolEaseBeats: number;
  /** Beats the field runs at the slow rate as the last rib eases (THE SLOW). */
  spoolSlowBeats: number;
  /** Beats the slack spool drifts for before the wave may end. */
  spoolSlackBeats: number;
}

export const SPOOL_DEFAULTS: SpoolConfig = {
  spoolReachMilli: 1000,
  spoolRateFastMilli: 120,
  spoolRateSlowMilli: 20,
  spoolZoneWideMilli: 360,
  spoolZoneNarrowMilli: 80,
  spoolLegBeats: 8,
  spoolGraceBeats: 3,
  spoolTautBeats: 2,
  spoolSlipBeats: 3,
  spoolEaseBeats: 3,
  spoolSlowBeats: 2,
  spoolSlackBeats: 3,
};
