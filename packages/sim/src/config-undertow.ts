/**
 * THE UNDERTOW's numbers — how many times it pushes up through the floor in
 * each part of the fight, how long a plate bows before the lobe comes
 * through, how long a lobe stands in its breach, and how long the last one
 * has to be held before the body follows it in (`undertow.ts`,
 * `docs/spec/bosses-choreographed.md` §13).
 *
 * Its own file for `config-baton.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.undertowBowBeats`, and the
 * split is about how much of one file a reader has to hold at once.
 *
 * **Every beat here is a call's worth of time.** A bow is player 1 seeing
 * the floor lift on his screen alone and saying the column; a stand is player
 * 1 opening the maw over it, or player 2 standing the plate on it, or both
 * of them agreeing which of two he can reach. `docs/spec/latency.md` puts a
 * word at about a beat and the press after it at another, so nothing here
 * that asks for a call is shorter than four.
 *
 * **Doubled on the owner's rule, 24 September 2026**
 * (`docs/spec/choreographed-windows.md`): the stand, the unseat and the last
 * lobe are twice what they were, the hold under the last is twice as long,
 * and the unseat asks for two slides — so none of them is a window that
 * lands itself.
 */
export interface UndertowConfig {
  /** Pushes in the first part: one column at a time, the maw alone answers. */
  undertowSingles: number;
  /** Pushes in the second part: two columns at once, `undertowPairGap` apart. */
  undertowPairs: number;
  /** Columns between the two lobes of a pair. Four: the maw reaches one, not both. */
  undertowPairGap: number;
  /** Pushes in the third part: a lobe too tall for the maw, which only the beam takes. */
  undertowTalls: number;
  /** Beats a plate bows before the lobe comes through it. */
  undertowBowBeats: number;
  /**
   * Beats a lobe stands in its breach before it withdraws and the breach is a
   * scar. **Longer than the four an unplated breach takes to reach
   * `undertowWideMilli`**, so the second lobe it lets through is a rule the
   * game performs — at four it withdrew at 300 of the 400 it needed
   * (`docs/spec/bosses.md` §11.20). Five until the doubling made it ten.
   */
  undertowStandBeats: number;
  /** Beats of empty field between one push resolving and the next bow beginning. */
  undertowRestBeats: number;
  /**
   * How much a breach with a lobe standing in it widens each beat the plate is
   * not on it, in thousandths of a tile. The shield standing on the column
   * stops it — the first time in the game the plate faces down.
   */
  undertowWidenMilli: number;
  /** Width, in thousandths, at which a breach lets a second lobe through next door. */
  undertowWideMilli: number;
  /**
   * Beats player 1 has to slide the cannon off its own column once the floor
   * bows under it, and off again wherever it follows him. Four, for two
   * slides, and seen rather than called: it is his screen and his thumb.
   */
  undertowUnseatBeats: number;
  /**
   * Slides the unseat asks for. Every one short of the last, the floor bows
   * again under the column the cannon stopped in (`undertowFollow`), inside
   * the same `undertowUnseatBeats`.
   */
  undertowUnseatSlides: number;
  /** Beats the cannon is unseated — every press from that seat swallowed — when he did not. */
  undertowUnseatedBeats: number;
  /**
   * Beats player 2's thumb has to stay on his column to haul the plate off him
   * and give the seat back, counted on the beat as the maw's hold is. Two of
   * the four: half the dead time is hers to win back, and she cannot have all
   * of it or the unseat would cost nothing at all (`undertow-hand.ts`).
   */
  undertowFreeBeats: number;
  /** Beats every seam lights and the whole edge bows before the last lobe comes up. */
  undertowRiseBeats: number;
  /** Beats the maw has to be open under the last lobe, counted on the beat, for the body to follow it in. */
  undertowHoldBeats: number;
  /** Beats the last lobe stands before it comes through anyway and the hull goes. */
  undertowLastBeats: number;
  /** Beats the body takes to pass through the breach once taken, before the wave may end. */
  undertowDownBeats: number;
  /**
   * Beats of THE SLOW opened on the body passing through. Every ask — a lobe
   * standing, the floor under the cannon, the last lobe — is slowed for its
   * own window instead (`undertowSlow`).
   */
  undertowSlowBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one push: four beats of a plate bowing, four of a lobe standing,
 * two of quiet — ten beats a push, nine pushes and the last one, which is
 * about two minutes of play if every lobe is taken, and one never is.
 */
export const UNDERTOW_DEFAULTS: UndertowConfig = {
  undertowSingles: 3,
  undertowPairs: 2,
  undertowPairGap: 4,
  undertowTalls: 2,
  undertowBowBeats: 4,
  undertowStandBeats: 10,
  undertowRestBeats: 2,
  undertowWidenMilli: 100,
  undertowWideMilli: 400,
  undertowUnseatBeats: 4,
  undertowUnseatSlides: 2,
  undertowUnseatedBeats: 4,
  undertowFreeBeats: 2,
  undertowRiseBeats: 4,
  undertowHoldBeats: 12,
  undertowLastBeats: 20,
  undertowDownBeats: 4,
  undertowSlowBeats: 2,
};
