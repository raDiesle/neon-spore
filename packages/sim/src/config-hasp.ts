/**
 * THE HASP's tuning: how long a grip lasts before it burns the hand off,
 * how long the burn holds, how far a wheel has to be wound to open a hasp,
 * how long the bolt has before it reaches the hull, and the story's four
 * states between the hasps.
 *
 * What is **not** here is the number of hasps: three sealed clasps down the
 * centre line is the silhouette and not a tuning, and it lives with the
 * picture it is (`hasp.ts`, `HASP_COUNT`). Nor is anything about *whose*
 * hand is whose — the latch is the pilot's and the wheel the navigator's,
 * always, and that is said once in `hasp-hand.ts`.
 *
 * **Doubled on the owner's rule, 24 September 2026**
 * (`docs/spec/choreographed-windows.md`): both fuses are twice what they were
 * and every winding asks twice the turn, so a longer grip is not a clasp that
 * opens itself. THE SLOW spans every grip, for its fuse (`haspSlow`).
 */
export interface HaspConfig {
  /** How far the latch travels under a thumb, in thousandths — the depth a drag is cut to. */
  haspReachMilli: number;
  /**
   * How deep the latch counts as **gripped**, in thousandths of the reach.
   *
   * Two thirds: a thumb that brushes the latch has not taken it, and a thumb
   * that means to has no doubt. This is a **level** rather than an edge — the
   * whole gesture is *keep holding*, so what the wheel asks every tick is
   * whether the hand is down now, not whether it crossed something once.
   */
  haspGripMilli: number;
  /** Beats the row hangs sealed before the first latch lights. */
  haspStillBeats: number;
  /**
   * Beats one grip lasts before the latch burns the hand off it — the
   * pilot's whole clock, and the only thing he is ever shown about it is his
   * own hand's colour coming up (`haspHeatMilli`). Twelve; six until the
   * doubling.
   */
  haspHoldBeats: number;
  /** Beats a grip lasts on the last hasp, where the design shortens the fuse —
   * eight; four until the doubling. */
  haspLastHoldBeats: number;
  /** Beats the latch stays too hot to take after it has burned a hand off. */
  haspBurnBeats: number;
  /**
   * How far the wheel has to be wound to open the **first** hasp, in
   * thousandths of a turn — a little over one and a half turns of a thumb
   * since the doubling, and a little under one before it.
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
  /** Beats the loose bolt has before it reaches the hull. */
  haspBoltBeats: number;
  /** Beats the open row hangs across the field before the wave may end. */
  haspClearBeats: number;
  /**
   * **The story between the hasps** (`hasp-story.ts`). Beats the rattle and
   * the sway each wait for their hold before the door strikes the hull and
   * the state starts again.
   */
  haspStoryBeats: number;
  /** The rattle: beats in a row the latch is kept gripped to quiet the hinge. */
  haspRattleBeats: number;
  /** The backspin: beats she has to wind the spring back against it. */
  haspBackspinBeats: number;
  /** The backspin: wheel travel that catches the spring, in thousandths of a turn, either way round. */
  haspWindTravelMilli: number;
  /** The rust: beats to rock it loose before it bursts against the hull. */
  haspRustBeats: number;
  /** The rust: reversals rocked into the wheel, with the latch held, that break it. */
  haspRustRocks: number;
  /**
   * The rust: how far a sweep has to go, in thousandths of a turn, before
   * turning back counts as a rock — so a thumb's tremble is not one.
   */
  haspRockMilli: number;
  /**
   * The sway: beats in a row both hold — the latch gripped and her hand still
   * on the wheel — to settle the doors. Not `haspSwingBeats`, which is §20's
   * name for it and was already the beats a hasp takes swinging open.
   */
  haspSwayBeats: number;
  /** The sway: travel inside one beat, in thousandths of a turn, that still counts as a hand held still. */
  haspStillMilli: number;
  /** Whether the story opens between the hasps at all. Off only in the
   * rehearsal, which stops at the first hasp: the story is met in the wave
   * (`content/scene-script.ts`), THE RATCHET's rule. */
  haspStory: boolean;
}

export const HASP_DEFAULTS: HaspConfig = {
  haspReachMilli: 1000,
  haspGripMilli: 660,
  haspStillBeats: 2,
  haspHoldBeats: 12,
  haspLastHoldBeats: 8,
  haspBurnBeats: 2,
  haspWindMilli: 1600,
  haspWindStepMilli: 800,
  haspSwingBeats: 3,
  haspBoltBeats: 4,
  haspClearBeats: 3,
  haspStoryBeats: 12,
  haspRattleBeats: 3,
  haspBackspinBeats: 8,
  haspWindTravelMilli: 1600,
  haspRustBeats: 10,
  haspRustRocks: 4,
  haspRockMilli: 120,
  haspSwayBeats: 3,
  haspStillMilli: 40,
  haspStory: true,
};
