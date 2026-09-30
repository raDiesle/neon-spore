/**
 * THE GAUGE's numbers — the first of the twelve rounds, and its whole
 * difficulty (`gauge.ts`, `docs/spec/interludes.md`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-boss.ts` and `config-pair.ts` already give: every call site still
 * reads `cfg.gaugeLevelMarks`, and the split is about how much of one file a reader
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
  /** Marks that pass one level of the round. */
  gaugeLevelMarks: number;
  /** Beats one level lasts before time runs out. Failing costs exactly this. */
  gaugeLevelBeats: number;
  /** Levels in the round, each harder than the one before (`gauge-level.ts`). */
  gaugeLevels: number;
  /** How much faster the band walks each level up, in thousandths a beat. */
  gaugeLevelDriftMilli: number;
  /** How much narrower the band's half-width is each level up, in thousandths. */
  gaugeLevelSpanMilli: number;
  /** Beats of bare rim between two levels, the level's clock held full. */
  gaugeLevelRestBeats: number;
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
  /**
   * Ticks a shot is in the air, from the cannon to the rim. A call is judged
   * where the bolt lands, so this is how long the pair watches it go.
   */
  gaugeShotTicks: number;
  /** Beats the rim stands bare after a wound is shot out, before the next opens. */
  gaugeRegrowBeats: number;
  /** Beats the rest after the first level lasts, spent on the loose tooth. */
  gaugeToothBeats: number;
  /** How far a tooth is dragged before it comes out, in thousandths of a tile. */
  gaugeToothPullMilli: number;
  /** Beats the rest after the second level lasts, spent on the tongue. */
  gaugeTongueBeats: number;
  /** How far each hand turns the tongue, its own way, before it twists, in thousandths of a tile. */
  gaugeTongueTwistMilli: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`. At 96 BPM a beat is 0.625 s, so
 * `gaugeLevelBeats` is thirty seconds a level.
 *
 * **Three levels, each harder** (the owner, 29 September 2026: *add more
 * levels (at least 3 and it should become harder, maybe the mouth moves faster
 * … or becomes bigger every level)*). Each level up walks the band
 * `gaugeLevelDriftMilli` faster — 18, 26, 34 — and cuts its half-width
 * `gaugeLevelSpanMilli` narrower — 60, 52, 44 — so the third is a band nearly
 * twice as quick and a quarter slimmer. Three marks a level keeps the whole
 * round near the ninety seconds it was, plus the rests between. The bound
 * width stays 18 on every level: it is the bind's own number, and 18 is still
 * well under the narrowest level's 44.
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
 *
 * **The shot is judged where it lands** (the owner, 29 September 2026: *first
 * shot must reach the coloured area, and then destroyed if correct colour, and
 * then with at least 1 … break the new area to aim for appears*).
 * `gaugeShotTicks` at 45 is six tenths of a beat — long enough to watch the
 * bolt cross the mouth, short enough that it is still the call's answer and
 * not a second event. `gaugeRegrowBeats` at 2 is the bare rim after a wound is
 * shot out: the break he asked for, and a beat more so the burst is seen.
 *
 * **The tooth** (`gauge-tooth.ts`, 30 September 2026). `gaugeToothBeats` at
 * 16 is ten seconds: time for him to count along the rim out loud and for her
 * to count along with him, and short enough that a pair who pulls it at once
 * gets the rest back. `gaugeToothPullMilli` at 800 is most of a tile — a pull,
 * not a brush of the thumb on the way somewhere else.
 *
 * **The tongue** (`gauge-tongue.ts`, 30 September 2026). `gaugeTongueBeats` at
 * 16 is the tooth's rest again: long enough to count *three, two, one* twice
 * over after a first try that came apart. `gaugeTongueTwistMilli` at 800 is
 * the tooth's pull, asked of each thumb, so the two halves weigh the same and
 * neither of them can do the other's by dragging further.
 */
export const GAUGE_DEFAULTS: GaugeConfig = {
  gaugeTurnMilli: 3,
  gaugeDriftMilli: 18,
  gaugeSpanMilli: 60,
  gaugeLevelMarks: 3,
  gaugeLevelBeats: 48,
  gaugeLevels: 3,
  gaugeLevelDriftMilli: 8,
  gaugeLevelSpanMilli: 8,
  gaugeLevelRestBeats: 4,
  gaugeCallRestBeats: 2,
  gaugeSettleBeats: 2,
  gaugeBindMarks: 2,
  gaugeBoundSpanMilli: 18,
  gaugeShotTicks: 45,
  gaugeRegrowBeats: 2,
  gaugeToothBeats: 16,
  gaugeToothPullMilli: 800,
  gaugeTongueBeats: 16,
  gaugeTongueTwistMilli: 800,
};
