/**
 * THE BALLOON's numbers: how long one swells before it moves, how fast it
 * climbs, how many times it comes apart, how hard the two hands have to pull
 * and what a burst costs the hull (`balloon.ts`, `balloon-pull.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-choir.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.balloonRiseRows`, and the split is only about how much of one
 * file a reader has to hold at once.
 *
 * **Its own file rather than seven more rows in `config-creatures.ts`**, and
 * THE CHOIR's file next door makes the argument these seven make again: they
 * are decided **together**. How long a body hangs there, how fast it leaves,
 * how far each hand has to travel and how long the pair therefore has to agree
 * on which one to take next are one decision about how hard the creature is,
 * and a reader who moves one has to move the rest.
 */
export interface BalloonConfig {
  /**
   * Beats a balloon stands still, swelling, before it starts to climb — both
   * on the beat it appears and on the beat a rub splits it in two. One number
   * for both, because it is one picture: a body growing into the field from
   * nothing, which is what a fresh arrival does and what each half of a split
   * one does again.
   *
   * Two beats, which is the delay the owner asked for after a split: long
   * enough for the pair to see that one thing has become two and to say which
   * of them goes next, short enough that the field is never waiting.
   */
  balloonSwellBeats: number;
  /**
   * Rows a balloon climbs a beat, and columns it takes to the side on the same
   * beat — one number, because the path is a diagonal and a diagonal is the
   * two being equal. The wave may author its own (`WaveEntry.rise`); this is
   * what an arrival that names none climbs at.
   *
   * One, which is a slick's speed read upward. It has thirteen rows to cross
   * from the row above the ship to the top of the field, which is about nine
   * seconds — well past the four a spoken exchange needs
   * (`.claude/skills/new-creature`, step 4), and it has to be: the exchange is
   * *which one*, and there are usually several.
   */
  balloonRiseRows: number;
  /**
   * How many times a fresh balloon comes apart before a rub finishes it. One:
   * the first rub splits it into two small ones and the second pops each of
   * them, which is the owner's own shape for this creature. Two would be seven
   * bodies out of one arrival, which is THE ECHO's picture and not this one.
   */
  balloonSplits: number;
  /**
   * Thousandths of a tile a hand has to carry a balloon's handle **outward**
   * before that side counts as pulled. A little over a tile: far enough that a
   * thumb brushing the body never counts, short enough that both seats can
   * hold their side taut at the same instant with one hand each.
   */
  balloonTautMilli: number;
  /**
   * Thousandths of a tile from a balloon's own centre to where each of its two
   * handles rests. The one place it is said, so the circle a finger is
   * answered at and the circle the picture draws cannot disagree.
   */
  balloonHandleMilli: number;
  /**
   * What a balloon costs the hull when it reaches the top of the field and
   * bursts. Above `damageCreature`, and that is the creature: every other body
   * in the game is answered on the way *to* the ship, so a pair who leave one
   * alone are only out of time. This one leaves on its own and takes a piece
   * of the ship with it however far away it got, so the price has to be worth
   * putting two pairs of hands on rather than shooting something else.
   */
  damageBalloonBurst: number;
  /** What the first rub is worth — the one that splits a body in two rather
   * than finishing it. `scoreClaspBreak`'s figure, and the pairing is the
   * argument: both are a body that **stops being what it was** rather than
   * dying, and two prices for one shape of moment would say the two moments
   * are different. */
  scoreBalloonRub: number;
  /** What popping one is worth. `scoreDestroy`'s figure and no more: the pair
   * has already been paid for the rub that made this body, so paying a
   * premium here would price one arrival above two. */
  scoreBalloonPop: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const BALLOON_DEFAULTS: BalloonConfig = {
  balloonSwellBeats: 2,
  balloonRiseRows: 1,
  balloonSplits: 1,
  balloonTautMilli: 1200,
  balloonHandleMilli: 900,
  damageBalloonBurst: 16,
  scoreBalloonRub: 120,
  scoreBalloonPop: 100,
};
