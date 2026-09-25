/**
 * **THE WARDEN's second and third gestures**: how far a swipe has to travel
 * to throw the hatch, and how long a thrown hatch stays open before it slams
 * (`warden-hand.ts`, `docs/spec/bosses.md` §11.4, *Three phases, three
 * gestures*).
 *
 * Its own file, next to `config-throat.ts` and for its reason: `SimConfig`
 * extends it rather than nesting it, so every call site reads
 * `cfg.wardenThrowBeats`. The boss's *place* — its row, how far the line
 * hangs, how taut a pull has to be — stays in `config-boss.ts`; these two are
 * a count the pair says out loud, which is what `config-boss-clocks.ts`
 * groups.
 */
export interface WardenHandConfig {
  /**
   * How far player 1's thumb has to travel across the hatch, in thousandths
   * of a tile, for the lift to read as a throw rather than a tap
   * (`warden-hand.ts`).
   *
   * 1500: a tile and a half, which is the width of a deliberate swipe on a
   * phone and more than the drift of a thumb settling. THE MIRROR's carry is
   * a third of that because a carry is a nudge; a hatch on the last plate is
   * thrown, and the gesture has to feel like the word.
   */
  wardenThrowMilli: number;
  /**
   * Beats a thrown hatch stays open before it slams shut of its own weight.
   *
   * 3: the width of *now — fire* said across a voice delay and a thumb
   * finding the colour. Two shuts on the word; four is long enough that the
   * throw stops being the thing the pair has to time together, and under
   * GLARE the timing is the whole of the fight.
   */
  wardenThrowBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`: a tile and a half, three beats. */
export const WARDEN_HAND_DEFAULTS: WardenHandConfig = {
  wardenThrowMilli: 1500,
  wardenThrowBeats: 3,
};
