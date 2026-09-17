/**
 * THE HIVE's numbers — how many breach sites the underside has, how long it
 * hangs before the first opens, how often one opens after that and how
 * long a site swells first, how often an open breach spills, from how many
 * open sites the openings come in pairs, what a wrong colour costs, and how
 * long the sealed body hangs before the wave may end (`hive.ts`,
 * `docs/spec/bosses.md` §11.14).
 *
 * Its own file for `config-lead.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.hiveOpenBeats`.
 *
 * **The opening clock is fixed, and sealing does not slow it.** That is the
 * design's open question answered the plain way: the fight is as long as
 * the sites times the clock, and what the pair's speed buys is how many
 * breaches are spilling at once, not how soon the next one opens. A clock
 * the pair could slow is a clock they could stop, and then the boss has no
 * length.
 */
export interface HiveConfig {
  /** Breach sites along the underside. Never more than the inner columns (`hiveSiteCols`). */
  hiveSites: number;
  /** Beats it hangs, whole, before the first site opens. */
  hiveLookBeats: number;
  /** Beats between one opening and the next. */
  hiveOpenBeats: number;
  /** Beats before an opening that the site swells — the navigator's warning. */
  hiveSwellBeats: number;
  /** Every this many beats, each open breach spills a rock down its column. */
  hiveSpillBeats: number;
  /** Sites opened from which two open at once rather than one. */
  hiveTwinFrom: number;
  /** Beats the next spill is brought forward by a wrong colour into a breach. */
  hiveProvokeBeats: number;
  /** Beats the field runs at a third rate from the last seal (THE SLOW). */
  hiveSlowBeats: number;
  /** Beats the sealed body hangs before the wave may end. */
  hiveOutBeats: number;
}

/**
 * Nine sites on an eleven-column field is every inner column. Eight beats
 * an opening with three of spill is two rocks a breach before the next
 * opens — the pair that seals each as it opens wards two rocks a cycle,
 * and the pair that does not is warding four, then six. Twins from the
 * fifth opening is the design's *more breaches open over time*, with the
 * last five sites coming in three openings instead of five.
 */
export const HIVE_DEFAULTS: HiveConfig = {
  hiveSites: 9,
  hiveLookBeats: 4,
  hiveOpenBeats: 8,
  hiveSwellBeats: 3,
  hiveSpillBeats: 3,
  hiveTwinFrom: 5,
  hiveProvokeBeats: 2,
  hiveSlowBeats: 1,
  hiveOutBeats: 3,
};
