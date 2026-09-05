/**
 * THE CRAWLER's five numbers: how long a worm is when the wave does not say,
 * how fast it walks, what getting rid of it is worth, and what letting it in
 * costs (`crawler.ts`).
 *
 * Its own file rather than five more rows in `config-creatures.ts`, for the
 * reason `config-strand.ts` and `config-veer.ts` each record: that file is at
 * its limit, and these five only mean anything against each other. A length
 * argued without the pace is a length nobody knows the pair has time for, and
 * a price for letting one in argued without the length is a price for a body
 * whose size nobody has fixed.
 *
 * `SimConfig` extends this rather than nesting it, so every call site still
 * reads `cfg.crawlerSegments` and the split is only about how much of one file
 * a reader has to hold at once.
 *
 * **There is no fall speed here, and that is the point.** A crawler never
 * falls — `fallTilesPerBeat` answers zero for it, the way it does for a wisp —
 * and it never reaches the hull either, so `damageCreature` has nothing to say
 * about one. The only way it costs the ship anything is the far wall, and that
 * is the last two numbers below.
 */
export interface CrawlerConfig {
  /**
   * Segments between the two ends when the wave does not author a count.
   * Five, which is one full turn of the red-cyan-armour cycle and most of a
   * second one — the smallest length at which the pair meets every answer the
   * creature has and then meets one of them again, which is the difference
   * between reading an order and having a plan.
   *
   * A wave may ask for `CRAWLER_MIN`..`CRAWLER_MAX`; `crawlerSegmentCount` is
   * the clamp and it is never re-derived.
   */
  crawlerSegments: number;
  /**
   * Beats between one column of walking and the next. Two, and the beat it
   * stands still on is what the creature is made of: a worm that moved every
   * beat would be a body the cannon has to be led, and leading is a thing one
   * player does alone. At two the pair gets a whole beat in which the column
   * they just agreed on is still true, which is exactly one voice delay.
   *
   * With eleven columns that is twenty-two beats of walking, a little under
   * fourteen seconds at 96 BPM — six or seven answers if the pair is quick,
   * four if they are talking it through.
   */
  crawlerStepBeats: number;
  /**
   * What the beam is worth: the whole worm, paid once, when the last segment
   * comes off and the two ends go up.
   *
   * `scoreWave`'s figure rather than `scoreDestroy`'s, because that is the
   * size of the thing: every segment has already paid its own kill or its own
   * deflection through the ordinary paths, and this is the bonus for having
   * held one order across both controls for the length of a wave.
   */
  scoreCrawlerBeam: number;
  /**
   * What the head costs the ship when it gets in, before the body behind it is
   * counted. `damageMeteor`'s figure: a rock nobody warded is the plainest
   * thing in the game that got through, and a worm's head is that with a mouth
   * on it.
   */
  damageCrawlerBite: number;
  /**
   * What each segment still on the body adds to that. Half of
   * `damageCreature`, so a worm let in whole costs a good deal more than a rock
   * and a worm stripped to its last segment costs a little more — the pair's
   * work is subtracted from the price rather than being all-or-nothing, which
   * is what stops a run that went badly from being a run worth abandoning.
   */
  damageCrawlerSegment: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const CRAWLER_DEFAULTS: CrawlerConfig = {
  crawlerSegments: 5,
  crawlerStepBeats: 2,
  scoreCrawlerBeam: 300,
  damageCrawlerBite: 20,
  damageCrawlerSegment: 6,
};
