/**
 * THE MOTH's numbers — where it hangs, how wide its wings reach, how long it
 * waits on a still light, how fast it drifts to one and how long it takes to
 * land (`moth.ts`). Which spots are lit, and when it sheds or hops, is
 * content, not config (`MOTH_SCRIPT`).
 *
 * Its own file for `config-gorge.ts`' reason: `SimConfig` extends it rather
 * than nesting it, so every call site reads `cfg.mothRow`.
 */
export interface MothConfig {
  /** The row its body and wings hang on, from the top of the field, before it sinks. */
  mothRow: number;
  /** Columns either side of its body its wings cover; the farthest a spot sits. */
  mothSpan: number;
  /** Beats it takes to flutter in before the first spots light. */
  mothEnterBeats: number;
  /** Beats it rests between one step and the next. */
  mothRestBeats: number;
  /** Beats it hangs beaten before it goes, so the wave cannot end on the same beat. */
  mothSpentBeats: number;
  /** Beats the cannon must stand still in a column before the moth turns to it. */
  mothNoticeBeats: number;
  /** Beats it takes to drift one column toward a light it has noticed. */
  mothDriftBeats: number;
  /** Beats it sinks over the cannon before it lands on it. */
  mothLandBeats: number;
  /** Thousandths of a row it sinks every beat it hangs over the cannon. */
  mothSinkMilli: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: wings on row three, two columns either side of the body,
 * four beats to come in, three between steps and three after the last. A
 * light still for four beats is noticed — two and a half seconds to fire
 * after the cannon stops — and the moth drifts a column a beat to it, then
 * sinks for six beats, half a row each, before it lands: three rows lower,
 * where a bolt meets its belly sooner.
 */
export const MOTH_DEFAULTS: MothConfig = {
  mothRow: 3,
  mothSpan: 2,
  mothEnterBeats: 4,
  mothRestBeats: 3,
  mothSpentBeats: 3,
  mothNoticeBeats: 4,
  mothDriftBeats: 1,
  mothLandBeats: 6,
  mothSinkMilli: 500,
};
