/**
 * THE STARE's numbers — how long the eye is turned away, how much warning a
 * turn gives, and how long a look lasts (`stare.ts`, `docs/spec/bosses.md`).
 *
 * Its own file for the reason `config-claw.ts` and `config-scout.ts` give:
 * `SimConfig` extends it rather than nesting it, so every call site still
 * reads `cfg.stareLookBeats`, and the split is about how much of one file a
 * reader has to hold at once.
 *
 * **Every number here is a sentence's worth of time.** The round is two people
 * saying *it is you, hands off* and then *clear* — so the warning has to be
 * long enough to say the first one and the look short enough that the second
 * is worth waiting for. `docs/spec/latency.md` puts a spoken exchange at
 * 2.1–3.6 seconds, which is where the tell's length comes from and is the only
 * reason it is not shorter.
 */
export interface StareConfig {
  /**
   * Beats the eye is turned away at the start, which is the pair's whole
   * working window.
   *
   * 12 is about nine seconds at the usual tempo: long enough to answer two or
   * three arrivals, short enough that a wave is not a normal wave with an
   * interruption in it.
   */
  stareAwayBeats: number;
  /**
   * Beats of warning between the eye beginning to turn and the look landing.
   *
   * **The tell is the whole fairness of the boss.** 4 beats is three seconds,
   * which is one spoken sentence — *it is you* — and nothing more. Shorter and
   * the pair is being asked to react rather than to talk, which is the one
   * thing this game is not; longer and the freeze stops being a surprise the
   * field can punish.
   */
  stareTellBeats: number;
  /**
   * Beats the first look lasts, with nothing the watched seat may press.
   *
   * 6 is four and a half seconds of one player sitting on their hands while
   * the other plays the field alone — long enough to be frightening, short
   * enough that the bodies still falling are the other seat's problem rather
   * than a foregone loss.
   */
  stareLookBeats: number;
  /**
   * Beats every later look adds to the one before it.
   *
   * The wave tightens rather than repeating: a pair that has learned the
   * rhythm has learned a rhythm that is getting longer, so the last look of a
   * wave is the one that costs something. 2 beats a look reaches
   * `stareLookMaxBeats` in four looks, which is about the length of a wave.
   */
  stareLookGrowBeats: number;
  /** The ceiling on that growth. A look nobody could survive is not a look. */
  stareLookMaxBeats: number;
  /**
   * Beats the eye takes to turn back before the next window opens.
   *
   * Short, and its own number rather than folded into the away window,
   * because what it is for is the picture: a look that ended the instant its
   * last beat did would read as a cut rather than as a head turning.
   */
  stareTurnBackBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one cycle: twelve beats to play, four of warning, six frozen, two
 * turning back — twenty-four beats, which is two bars of the game's own
 * counting and the length a wave's entries are already written against.
 */
export const STARE_DEFAULTS: StareConfig = {
  stareAwayBeats: 12,
  stareTellBeats: 4,
  stareLookBeats: 6,
  stareLookGrowBeats: 2,
  stareLookMaxBeats: 12,
  stareTurnBackBeats: 2,
};
