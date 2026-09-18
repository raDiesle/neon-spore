/**
 * THE GAUGE's numbers — the first of the twelve rounds, and its whole
 * difficulty (`gauge.ts`, `docs/spec/interludes.md`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-boss.ts` and `config-pair.ts` already give: every call site still
 * reads `cfg.gaugeMarks`, and the split is about how much of one file a reader
 * has to hold at once. `config.ts` had eight lines left under the size limit
 * and this needed twenty, which is the immediate reason; the better one is
 * that a round is a subject of its own, and the next eleven will each want a
 * block like this rather than another twenty lines in the middle of the
 * field's own tunables.
 *
 * **This is the run's tuning and it is the only home for it.** What the round
 * *is* — that a wave carries it at all — is authored in `waves.ts` as
 * `boss: { kind: "gauge" }`, the same as every other boss. Two mechanisms, and
 * a round that seems to need a third has data on the wrong side of that line.
 *
 * Distances are thousandths of the dial and times are beats. Nothing here is
 * in milliseconds, and that is not a style choice: a round hangs off the beat
 * like everything else in this package, because a round whose difficulty was a
 * wobble in wall-clock time could not be played in lockstep at all.
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
  /**
   * Beats a needle that was moved by hand must stand before a call counts. The
   * whole cost of the jam: the hand is instant where the valve is not, and what
   * it buys back is that the pair cannot call the moment it arrives.
   */
  gaugeSettleBeats: number;
  /** Landed marks between one winding of the band and the next. */
  gaugeBindMarks: number;
  /**
   * Half the band's width while it is wound tight, in thousandths — narrow
   * enough that the pair would rather spend the thumb than talk into it.
   */
  gaugeBoundSpanMilli: number;
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
 *
 * **The three numbers under the two states are set against those two**
 * (`gauge-hand.ts`, 18 September 2026). `gaugeSettleBeats` at 2 is a little
 * over a second: long enough that a hand is not simply a faster valve, short
 * enough that the pair does not stop talking while it runs. `gaugeBindMarks`
 * at 2 binds the band on the second mark and every other one after it, so the
 * round alternates rather than ending in one state. `gaugeBoundSpanMilli` at
 * 18 is under a third of `gaugeSpanMilli`: a band 36 wide against a needle
 * that crosses 3 a tick is about twelve ticks of window, which is a thing a
 * pair can hit and not a thing they can talk into.
 */
export const GAUGE_DEFAULTS: GaugeConfig = {
  gaugeTurnMilli: 3,
  gaugeDriftMilli: 18,
  gaugeSpanMilli: 60,
  gaugeMarks: 5,
  gaugeRoundBeats: 128,
  gaugeCallRestBeats: 2,
  gaugeSettleBeats: 2,
  gaugeBindMarks: 2,
  gaugeBoundSpanMilli: 18,
};
