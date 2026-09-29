/**
 * THE SPOOL's tuning: how far the brake travels, how fast and how slow the
 * line runs at either end of it, how wide the zone opens and how much it
 * narrows a rib, how long each leg, each grace and each pause holds, and the
 * story's three states between the ribs.
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
  /**
   * **The story between the ribs** (`spool-story.ts`). The snag: beats in a
   * row the brake has to be let right off before a grip frees the line.
   */
  spoolSnagBeats: number;
  /** The snag: beats it waits for the let-go and the grip before the line snaps taut against the hull. */
  spoolSnagWindowBeats: number;
  /** The whip: beats in a row the brake is held at full depth to damp the loop. */
  spoolWhipBeats: number;
  /** The whip: beats before the loop lashes the hull and is thrown again. */
  spoolWhipWindowBeats: number;
  /** The whip: how deep counts as full depth, in thousandths of the reach. */
  spoolWhipDeepMilli: number;
  /** The fray: beats in a row the brake is held featherlight to hold the fray. */
  spoolFrayBeats: number;
  /** The fray: beats before a strand snaps and whips the hull, and the fray again. */
  spoolFrayWindowBeats: number;
  /**
   * The fray: how deep a hold may go and still be featherlight, in
   * thousandths of the reach. A hand is on the brake — no hand at all is the
   * snag's answer, not this one.
   */
  spoolFrayLightMilli: number;
  /** Whether the story opens between the ribs at all. Off only in the
   * rehearsal, which stops before the second rib: the story is met in the
   * wave (`content/scene-script.ts`), THE RATCHET's rule. */
  spoolStory: boolean;
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
  spoolSnagBeats: 2,
  spoolSnagWindowBeats: 8,
  spoolWhipBeats: 3,
  spoolWhipWindowBeats: 10,
  spoolWhipDeepMilli: 850,
  spoolFrayBeats: 4,
  spoolFrayWindowBeats: 12,
  spoolFrayLightMilli: 150,
  spoolStory: true,
};
