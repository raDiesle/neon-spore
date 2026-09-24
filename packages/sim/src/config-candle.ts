/**
 * THE CANDLE's numbers — how many steps its glow has, how long the field
 * takes to go black, how often the glow drifts and how often it turns to face
 * a new column, and how long the frame holds black after the last step goes
 * out (`candle.ts`, `docs/spec/bosses-choreographed.md` §14).
 *
 * Its own file for `config-undertow.ts`' reason: `SimConfig` extends it
 * rather than nesting it, so every call site reads `cfg.candleGlowSteps`,
 * and the split is about how much of one file a reader has to hold at once.
 *
 * **Every beat here is a call's worth of time.** The column the boss faces is
 * on player 1's screen alone and is the one column player 2 must not fire
 * from; the glow's drift is a column she has to be told; so nothing here that
 * asks for a call is shorter than three (`docs/spec/latency.md`).
 */
export interface CandleConfig {
  /**
   * Steps of glow the boss has, which is its health: it dims one a hit and
   * goes out at none. Five, because five is how many a pair can tell apart
   * in the only thing they can see (§14, *Animation*).
   */
  candleGlowSteps: number;
  /** Beats the field takes to go black once the boss is in. Render's count; the sim keeps it so the pair can be told. */
  candleDarkBeats: number;
  /** Beats between the glow drifting one column, while it still moves. */
  candleMoveBeats: number;
  /** Beats between the boss turning to face a new column, while it still eats. */
  candleTurnBeats: number;
  /** Steps of glow left at which it begins eating flashes in the column it faces. */
  candleEatSteps: number;
  /** Steps of glow left at which it stops moving and stops eating: the last glow. */
  candleLastSteps: number;
  /**
   * How far down the pilot's thumb carries the flame to pull it off the wick,
   * in thousandths of a tile (`candle-hand.ts`). Three tiles: far enough
   * that a thumb brushing the glow in the dark is not a pull, short enough to
   * be one stroke on a phone held in one hand.
   *
   * **Doubled on the owner's rule, 24 September 2026**, from a tile and a
   * half, beside `candleSmokeBeats` (`docs/spec/choreographed-windows.md`):
   * a window twice as long asks twice as much of the hand that opens it.
   */
  candlePinchMilli: number;
  /**
   * Beats the wick smokes before it lights again. The navigator has to fill a
   * lobe and stand the beam in the column inside this, and the pilot has to
   * say which column — so it is a call's worth of time and then some
   * (`docs/spec/latency.md`).
   *
   * **Doubled on the owner's rule, 24 September 2026**, from six, and it is
   * the ask this fight has with a clock on it: THE SLOW opens for exactly
   * this many beats on the tick the flame comes off (`candle-hand.ts`) and
   * shuts on the beam landing or the wick lighting again (`candle-step.ts`).
   */
  candleSmokeBeats: number;
  /** Beats the frame is held black after the last step goes out, before the wave may end. */
  candleOutBeats: number;
  /**
   * Beats THE SLOW opens for on every flash — a bolt actually leaving the
   * muzzle, never one THE CANDLE ate. One, not the ordinary call's two
   * (`config-slow.ts`): a flash is **seen**, not called across the voice
   * delay — the pair's own press lit it, so there is nothing to be told about
   * it that a third-rate beat says better than the beat itself.
   */
  candleFlashSlowBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: four beats of the light going out, then a glow that
 * drifts every three beats and turns every four, four hits to bring it to its
 * last step, a pull and a beam inside twelve slowed beats to finish it, two
 * black beats.
 * A fight that is short in beats and long in the dark.
 */
export const CANDLE_DEFAULTS: CandleConfig = {
  candleGlowSteps: 5,
  candleDarkBeats: 4,
  candleMoveBeats: 3,
  candleTurnBeats: 4,
  candleEatSteps: 2,
  candleLastSteps: 1,
  candlePinchMilli: 3000,
  candleSmokeBeats: 12,
  candleOutBeats: 2,
  candleFlashSlowBeats: 1,
};
