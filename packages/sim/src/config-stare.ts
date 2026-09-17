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
   * 12 is seven and a half seconds at the tempo the game ships at, where a
   * beat is 0.625s: long enough to answer two or three arrivals, short enough
   * that a wave is not a normal wave with an interruption in it.
   */
  stareAwayBeats: number;
  /**
   * Beats of warning between the eye beginning to turn and the look landing.
   *
   * **The tell is the whole fairness of the boss**, and 4 beats is two and a
   * half seconds rather than the three it was chosen as. That is inside
   * `docs/spec/latency.md`'s 2.1–3.6s for a spoken exchange and under the same
   * page's floor of four seconds for anything whose answer needs announcing —
   * which the tell's answer does, because only the other seat is told who. 6
   * beats would be 3.75s and 7 would be 4.4s; the queue holds the question
   * rather than this comment, because it is a change to how the boss plays.
   * Shorter still and the pair is being asked to react rather than to talk,
   * which is the one thing this game is not; longer and the freeze stops being
   * a surprise the field can punish.
   */
  stareTellBeats: number;
  /**
   * Beats the first look lasts, with nothing the watched seat may press.
   *
   * 6 is three and three quarter seconds of one player sitting on their hands
   * while the other plays the field alone — long enough to be frightening,
   * short enough that the bodies still falling are the other seat's problem
   * rather than a foregone loss. THE STARE's wave puts every rock it sends
   * inside a look and every colour inside a working window, and a rock falls a
   * tile a beat from row 0 to the hull's 14 — so the tightest rock the wave
   * authors, the one at beat 67 under the ten-beat look, still has six beats
   * of open field after the eye turns away. The looks are survivable, and that
   * is measured rather than hoped.
   */
  stareLookBeats: number;
  /**
   * Beats every later look adds to the one before it.
   *
   * The wave tightens rather than repeating: a pair that has learned the
   * rhythm has learned a rhythm that is getting longer, so the last look of a
   * wave is the one that costs something. 2 beats a look reaches
   * `stareLookMaxBeats` on the fourth look, which begins at beat 94.
   */
  stareLookGrowBeats: number;
  /**
   * The ceiling on that growth. A look nobody could survive is not a look.
   *
   * **No pair has ever seen it.** THE STARE's wave sends its last rock on beat
   * 72 and that rock is at the hull by 86, so the wave is over before the
   * fourth look begins — the three looks a wave actually holds are 6, 8 and
   * 10, and 12 is a number the shipped game never reaches. The queue holds
   * what to do about it, because lengthening a wave, growing faster and
   * lowering this number are three different bosses.
   */
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
 *
 * **Only the first cycle is twenty-four**, because the look is the part that
 * grows: the second is twenty-six and the third twenty-eight, so the eye
 * turns on beats 12, 36 and 62 rather than every twenty-four. That drift is
 * the boss rather than a flaw in it — a rhythm that stayed on the bar would
 * be a rhythm the pair could stop listening for — but it is the reason a
 * wave's rocks cannot simply be written every twenty-four beats.
 */
export const STARE_DEFAULTS: StareConfig = {
  stareAwayBeats: 12,
  stareTellBeats: 4,
  stareLookBeats: 6,
  stareLookGrowBeats: 2,
  stareLookMaxBeats: 12,
  stareTurnBackBeats: 2,
};
