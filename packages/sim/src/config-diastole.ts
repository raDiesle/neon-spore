/**
 * **THE DIASTOLE's numbers**: two cadences that do not divide each other, how
 * much each chamber can take, and how long the bridge takes to burst
 * (`diastole.ts`, `docs/spec/bosses-choreographed.md` §7).
 *
 * Its own file for the reason `config-stare.ts` gives: `SimConfig` extends it
 * rather than nesting it, so every call site still reads
 * `cfg.diastoleLeftBeats`.
 *
 * **The two cadences are the boss and they are tuning anyway.** A wave that
 * authored them would be several different bosses wearing one name — THE
 * STARE's argument exactly — and worse than that here, because the pair's
 * whole job is to *count* them: a boss whose arithmetic changed per wave would
 * be a boss nobody could ever have learned. What a wave authors is `{ kind:
 * "diastole" }` and the arrivals underneath it.
 *
 * **Coprime, and it has to be said out loud in a comment, because a pair of
 * numbers that quietly stopped being coprime would quietly stop being the
 * boss.** 3 and 5 meet every 15 beats; 4 and 6 would meet every 12, which
 * sounds similar and is not — they would also meet every 2, and a coincidence
 * the pair falls into by accident is no coincidence at all.
 */
export interface DiastoleConfig {
  /**
   * Beats between contractions of the left chamber — player 1's, because
   * geometry says whose (`docs/spec/bosses-choreographed.md`, and THE
   * BALLOON's two handles are the shipped precedent).
   *
   * 3 is the shortest cadence a person can hold while talking about something
   * else, which is the whole of what this boss asks for. Two would be the
   * metronome and four would be countable without attention.
   */
  diastoleLeftBeats: number;
  /**
   * Beats between contractions of the right chamber — player 2's.
   *
   * 5 against 3, so the two meet every 15 beats and never on any beat
   * between. Fifteen beats is about eleven seconds at the game's own tempo:
   * long enough that a missed window costs something real, short enough that
   * the pair gets four or five of them in a wave.
   */
  diastoleRightBeats: number;
  /**
   * What the right chamber's cadence becomes once the left has collapsed and
   * there is no second rhythm left to count it against.
   *
   * 7, which is the design's own number and the point of it: the count the
   * pair spent the first half of the fight learning is not the count that
   * finishes it. Prime, so a pair still humming threes finds nothing.
   */
  diastoleRightAloneBeats: number;
  /**
   * Hits a chamber takes before it collapses.
   *
   * 3, and the fight's shape follows from it rather than from a phase table:
   * the left gives up two of them to ordinary shots while it is beating alone
   * — which is how the pair learns a cadence has to be *counted* rather than
   * watched — and everything after that is the lance in the bridge.
   */
  diastoleChamberHits: number;
  /**
   * Beats the bridge takes to fill from both ends and split in the middle.
   *
   * 4, and it is the payoff rather than a rule: nothing can be pressed while
   * it runs and the boss is already beaten when it starts. It is also the
   * length of the slow window over it, because a burst played at ordinary rate
   * is a burst the pair watched at the same speed as everything else that ever
   * happened to them.
   */
  diastoleBurstBeats: number;
  /**
   * Beats a clamp holds the right chamber contracted, once the left has
   * collapsed and the chamber beats alone (`diastole-hand.ts`).
   *
   * 2: a beat and the next, which is the width of a spoken *now* — the seat
   * that sees the chamber says it, the other seat presses, and a contraction
   * that was a single beat would be gone before the thumb came down. Three
   * would let a clamp held from any beat reach the next contraction, and the
   * clamp is meant to *lengthen* a beat the pair found, not to replace the
   * finding.
   */
  diastoleClampBeats: number;
  /**
   * Beats the right chamber spends in spasm after a clamp on the wrong beat,
   * or one held past its window — not beating, not hurt by anything.
   *
   * 8: the alone cadence and a beat over, so a wrong clamp always costs more
   * than waiting for the next contraction would have. Less and pressing at
   * random would be a way to play it.
   */
  diastoleSpasmBeats: number;
}

/**
 * The defaults, spread into `DEFAULT_CONFIG`.
 *
 * Read as one fight: three beats against five for fifteen, two chambers of
 * three hits each, then seven against nothing — held open two at a time by
 * a thumb, and eight lost for a thumb on the wrong beat.
 */
export const DIASTOLE_DEFAULTS: DiastoleConfig = {
  diastoleLeftBeats: 3,
  diastoleRightBeats: 5,
  diastoleRightAloneBeats: 7,
  diastoleChamberHits: 3,
  diastoleBurstBeats: 4,
  diastoleClampBeats: 2,
  diastoleSpasmBeats: 8,
};
