/**
 * THE GAUGE's six numbers — the first interlude's whole difficulty
 * (`gauge.ts`, `docs/spec/interludes.md`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-boss.ts` and `config-pair.ts` already give: every call site still
 * reads `cfg.gaugeMarks`, and the split is about how much of one file a reader
 * has to hold at once. `config.ts` had eight lines left under the size limit
 * and this needed twenty, which is the immediate reason; the better one is
 * that an interlude is a round of its own, and the next eleven will each want
 * a block like this rather than another twenty lines in the middle of the
 * field's own tunables.
 *
 * Distances are thousandths of the dial and times are beats. Nothing here is
 * in milliseconds, and that is not a style choice: an interlude hangs off the
 * beat like everything else in this package, because a round whose difficulty
 * was a wobble in wall-clock time could not be played in lockstep at all.
 */
export interface GaugeConfig {
  /** How far the pilot's valve moves the needle each tick, in thousandths. */
  gaugeTurnMilli: number;
  /** How far the band walks each beat, in thousandths. The whole of the pressure. */
  gaugeDriftMilli: number;
  /** Half the distance between the two marks, in thousandths. */
  gaugeSpanMilli: number;
  /** Marks that pass the round — four or five repetitions of one rule. */
  gaugeMarks: number;
  /** Beats the round lasts before time runs out. Failing costs exactly this. */
  gaugeRoundBeats: number;
  /** Beats between two calls, landed or not, so a held thumb is slower than talking. */
  gaugeCallRestBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`. At 96 BPM a beat is 0.625 s, so
 * `gaugeRoundBeats` is eighty seconds and the round with its lead-in and its
 * verdict is the ninety the category is written around.
 *
 * `gaugeTurnMilli` at 3 takes the needle end to end in about 2.8 seconds — the
 * pilot's valve is meant to be the strong one, and a dial that took longer to
 * cross than the voice delay would turn every correction into a conversation
 * the pair had already finished.
 */
export const GAUGE_DEFAULTS: GaugeConfig = {
  gaugeTurnMilli: 3,
  gaugeDriftMilli: 18,
  gaugeSpanMilli: 60,
  gaugeMarks: 5,
  gaugeRoundBeats: 128,
  gaugeCallRestBeats: 2,
};
