/**
 * THE BELLOWS's tuning: how far a handle has to be carried to count as
 * worked, how long the jam lasts, how long the one shared window is, and how
 * long each of the two hazards has before it reaches the hull.
 *
 * What is **not** here is the number of seams: four is the silhouette and not
 * a tuning, and it lives with the picture it is (`bellows.ts`,
 * `BELLOWS_SEAMS`). Nor is anything about *whose* handle is whose — that is
 * geometry, said once in `bellowsChamberCol`.
 */
export interface BellowsConfig {
  /** How far either handle travels, in thousandths — the depth a drag is cut to. */
  bellowsReachMilli: number;
  /**
   * How deep a handle counts as **worked**, in thousandths of the reach.
   *
   * Two thirds, and the figure is what makes the gesture discoverable: a
   * thumb that brushes a handle has not worked it, and a thumb that means to
   * has no doubt about whether it did. It is an edge and never a level — the
   * handle crossing this on its way down is the act, so a hand resting past
   * it costs nothing and a second act needs a second stroke (`bellows-hand.ts`).
   */
  bellowsWorkMilli: number;
  /** Beats the waist hangs tight before the first exchange's marks light. */
  bellowsStillBeats: number;
  /**
   * Beats both handles stay jammed after someone acts out of turn.
   *
   * The whole cost of the fight's one fault, and deliberately a beat of
   * nothing rather than a hull strike: the pair has to hear it, say whose it
   * was and start the exchange again, which is the conversation this boss is
   * for. A strike would end the wave for a mistake the design means them to
   * make twice.
   */
  bellowsJamBeats: number;
  /** Beats a parted seam takes before the next exchange's marks light. */
  bellowsSeamBeats: number;
  /**
   * Beats the third exchange's shared window holds — the one window in the
   * fight, and the movement that asks for both halves inside it (row 9).
   */
  bellowsWindowBeats: number;
  /**
   * Beats the leaking spark has before it reaches the hull.
   *
   * Four, for `gimbalSeamBeats`' reason and the same measurement: a bolt
   * crosses the field in a little over a beat, so the pair need one beat to
   * hear the leak, one to slide the cannon under it, one for the flight and
   * one of margin.
   */
  bellowsSparkBeats: number;
  /** Beats the field runs at a third rate as the waist splits (THE SLOW). */
  bellowsSlowBeats: number;
  /** Beats the vent hangs across the field before the wave may end. */
  bellowsVentBeats: number;
  /** How far off the waist each chamber hangs, in columns. */
  bellowsChamberCols: number;
}

export const BELLOWS_DEFAULTS: BellowsConfig = {
  bellowsReachMilli: 1000,
  bellowsWorkMilli: 660,
  bellowsStillBeats: 2,
  bellowsJamBeats: 2,
  bellowsSeamBeats: 3,
  bellowsWindowBeats: 3,
  bellowsSparkBeats: 4,
  bellowsSlowBeats: 2,
  bellowsVentBeats: 3,
  bellowsChamberCols: 2,
};
