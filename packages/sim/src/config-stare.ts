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
   * **The tell is the whole fairness of the boss**, and 7 beats is 4.38s at the
   * 96 bpm the game ships at. That is the **first value that clears
   * `docs/spec/latency.md`'s floor** of four seconds for anything whose answer
   * needs announcing — which the tell's answer does by construction, because
   * the seat is rolled at the top of the turn and shown only to the seat that
   * is *not* about to be frozen, so the whole of the warning is one player
   * saying YOU or THEM. It was 4, which is 2.50s: a pair at the slow end of
   * that page's own 2.1–3.6s exchange band had not finished the sentence when
   * the look landed. 6 beats (3.75s) would have been one bar of the game's own
   * counting and still short of the floor, so it would have needed an
   * exemption written down; 7 needs none, and costs an odd-length cycle.
   * Shorter and the pair is being asked to react rather than to talk, which is
   * the one thing this game is not; longer and the freeze stops being a
   * surprise the field can punish.
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
   * wave is the one that costs something. **3 and not 2**, so the looks run 6,
   * 9, 12 and reach `stareLookMaxBeats` on the *third* look. At 2 they ran 6,
   * 8, 10, 12 and the ceiling arrived on a fourth look that began after the
   * wave was over — a number the shipped game never reached.
   */
  stareLookGrowBeats: number;
  /**
   * The ceiling on that growth. A look nobody could survive is not a look.
   *
   * **A wave reaches it on its third look**, which is what
   * `stareLookGrowBeats` was moved to 3 for. It used to be unreachable: at a
   * growth of 2 the looks ran 6, 8, 10 and the fourth — the first one this
   * ceiling would have capped — began after the wave was over, so 12 was a
   * number the shipped game never produced. The other two ways out were
   * lengthening the wave and lowering this number to 10; the owner picked the
   * growth, because it is the only one that changes what a pair feels.
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
  /**
   * How far down the lid has to be pulled before it is shut, in thousandths
   * of a tile.
   *
   * 600 is a little over half a tile of thumb — enough that a hand brushing
   * the eye on its way to the field is not a decision, short enough that the
   * decision is one motion. The eye is `GAZE_TILES` across in the picture,
   * so the lid crosses about a fifth of it before the simulation says shut.
   */
  stareLidPullMilli: number;
  /**
   * Beats a shut lid stays shut before the eye forces it up on its own.
   *
   * 4 is two and a half seconds: the freed seat's whole reprieve, and the
   * length of one sentence — *I have it, play* — with a beat left to say *I
   * am letting go*. Longer and the lid would be a way to skip a look, which
   * would make the boss a boss two people learn to play around; shorter and
   * there would be nothing to hand over.
   */
  stareLidHoldBeats: number;
  /**
   * Beats the lid takes to rise before the eye looks at whoever pulled it.
   *
   * 2, and deliberately shorter than `stareTellBeats`, because there is
   * nothing to announce: the seat about to be watched is the one whose thumb
   * was on the lid, and they have known that since they pulled it. What the
   * two beats are for is the thumb — a hand still on the field when the lid
   * comes up has one bar of its own counting to get off the glass.
   */
  stareReopenBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one cycle: twelve beats to play, seven of warning, six frozen, two
 * turning back — twenty-seven beats. **It is deliberately not a whole number
 * of bars.** It was twenty-four, which was two of them, and the tell had to
 * grow to 7 to clear `latency.md`'s four-second floor; a rhythm that sat on
 * the bar would be one the pair could stop listening for, so the odd length
 * is a cost worth paying rather than a thing to tune back out.
 *
 * **And only the first cycle is twenty-seven**, because the look is the part
 * that grows: the second is twenty-nine and the third thirty-one, so the eye
 * turns on beats 12, 39 and 68 rather than on any fixed step. That drift is
 * the boss rather than a flaw in it, and it is the reason a wave's rocks
 * cannot simply be written every so many beats.
 */
export const STARE_DEFAULTS: StareConfig = {
  stareAwayBeats: 12,
  stareTellBeats: 7,
  stareLookBeats: 6,
  stareLookGrowBeats: 3,
  stareLookMaxBeats: 12,
  stareTurnBackBeats: 2,
  stareLidPullMilli: 600,
  stareLidHoldBeats: 4,
  stareReopenBeats: 2,
};
