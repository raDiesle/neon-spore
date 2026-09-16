/**
 * **THE SLOW's two numbers**: how slowly a slowed beat is played, and how long
 * a window lasts by default (`slow.ts`, `docs/decisions.md` #33).
 *
 * Its own file for the reason `config-stare.ts` and `config-claw.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.slowRateMilli`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * **Neither number is a tempo.** The beat is `bpm` and stays `bpm`;
 * `ticksPerBeat` is derived from it and never moves. What these two say is how
 * many milliseconds of wall clock one tick is worth while a window is open —
 * which is the loop's business and nobody else's (`apps/game/src/loop.ts`).
 * A configuration that could bend `ticksPerBeat` would be a configuration that
 * changes how far a body falls per beat, and that is the game rather than the
 * picture.
 */
export interface SlowConfig {
  /**
   * How fast a slowed beat is played, in thousandths of its ordinary rate.
   *
   * 333 is a third, which is the figure `docs/spec/bosses-choreographed.md`
   * asks for throughout and the one the reference game uses: slow enough that
   * a beat reads as a held breath rather than as a stutter, fast enough that
   * the metronome is still recognisably counting. Below about a fifth the
   * click stops sounding like a clock at all and the pair loses the one thing
   * they share.
   *
   * It is also the number the judder is measured against: at a third rate the
   * loop runs about two ticks every three frames where it ran two a frame, so
   * the same world is drawn twice unless the picture interpolates
   * (`apps/game/src/interpolate.ts`).
   */
  slowRateMilli: number;
  /**
   * Beats a window lasts when its caller has no length of its own.
   *
   * Two, because a window is a thing both players have to *notice* has opened
   * across a voice delay: one beat at a third rate is 2.2 seconds of wall
   * clock, which is inside the spoken exchange `docs/spec/latency.md` measures
   * and therefore a window that could be over before either of them said a
   * word about it. Two is the shortest that survives being talked about.
   */
  slowBeats: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const SLOW_DEFAULTS: SlowConfig = {
  slowRateMilli: 333,
  slowBeats: 2,
};
