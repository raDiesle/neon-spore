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
 * **Its own file rather than ten more rows in `config-creatures.ts`**, and
 * THE CHOIR's file next door makes the argument these ten make again: they
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
   * Rows a balloon climbs on a climbing beat, and columns it takes to the
   * side on the same beat — one number, because the path is a diagonal and a
   * diagonal is the two being equal. The wave may author its own
   * (`WaveEntry.rise`); this is what an arrival that names none climbs at.
   *
   * One. How *often* a climbing beat comes round is `balloonClimbBeats` below,
   * and the two together are the speed: a row every climbing beat, a climbing
   * beat every so many beats.
   */
  balloonRiseRows: number;
  /**
   * Beats between one climb and the next — how slowly a balloon leaves.
   *
   * The owner asked on 9 September 2026 for them to be **much slower**, and
   * this is the number that answers it rather than a fraction of a row: the
   * simulation stores integers, so a body cannot climb half a tile a beat,
   * and what it does instead is climb a whole tile every second beat
   * (`balloonClimbs`) — THE ECHO's arrangement, read upward. The picture
   * glides the tile over the whole two beats rather than over one and then
   * standing still (`balloonGlidePhase`), so what the pair sees is a body
   * drifting at half the speed and not one stopping and starting.
   *
   * Two, so the thirteen rows from the row above the ship to the top of the
   * field take about eighteen seconds, twice what they did. Three would be a
   * body that hangs for most of the wave on a field that usually holds several
   * of them, and two is already well past the four seconds a spoken exchange
   * needs (`.claude/skills/new-creature`, step 4).
   */
  balloonClimbBeats: number;
  /**
   * How many times a fresh balloon comes apart before a rub finishes it. One:
   * the first rub splits it into two small ones and the second pops each of
   * them, which is the owner's own shape for this creature. Two would be seven
   * bodies out of one arrival, which is THE ECHO's picture and not this one.
   */
  balloonSplits: number;
  /**
   * Thousandths of a tile a hand has to carry a balloon's handle **outward**
   * before that side counts as pulled.
   *
   * **Two tiles**, up from the little over one it began at: the owner asked on
   * 9 September 2026 for a hand to carry a handle further before it counts,
   * so that a pull is a gesture the other seat can watch happen rather than a
   * brush past the ring. What bounds it is the edge of the screen. On the
   * phones the game ships on the field is the full width of the glass, a
   * handle rests `balloonHandleMilli` out from its body, and the thumb on it
   * travels *outward* — so from a body in column `c` (counted from the wall
   * on that side) the pilot's thumb has `c + 0.5 - 1.15` tiles of screen to
   * cross before it runs off the edge and the pull is lost. From the third
   * column in that is 2.35 tiles; from the second it is 1.35, which the old
   * figure was already past. Two tiles keeps the third column reachable with
   * a little to spare, and nothing between 1.35 and 2.35 would reach a column
   * this does not. The two outer columns on each side are where a balloon is
   * turning anyway, and the pair takes it on the way in or on the way back.
   */
  balloonTautMilli: number;
  /**
   * Beats a balloon pulled taut on both sides **holds at full stretch**
   * before it gives.
   *
   * The owner asked for this on 9 September 2026. Without it both sides taut
   * on one tick rubbed on that tick, and two things were lost: the pair never
   * saw that they had done the thing together, and the split read as a
   * disappearance rather than as a consequence. So a body both hands have
   * reached sits at its limit for this long — the skin at its widest, the
   * halo coming up to full (`balloonHoldPhase`) — and then comes apart. A
   * hand that lets go inside the hold gives the hold back: nothing was
   * earned by getting there once.
   *
   * One beat. Long enough to be seen and said, short enough that a pair who
   * arrived together are not kept waiting on a body they have already
   * answered.
   */
  balloonHoldBeats: number;
  /**
   * Thousandths of a tile from a balloon's own centre to where each of its two
   * handles rests. The one place it is said, so the circle a finger is
   * answered at and the circle the picture draws cannot disagree.
   *
   * It has to clear the body, and the body has doubled: a full balloon is
   * `0.88` of a tile in half-height and `0.82` of that across, so its skin
   * reaches `0.72` of a tile out from the centre and a handle is `0.3` more
   * (`handleRadiusMilli`). At the old `900` the ring would have been drawn
   * inside the skin it hangs off — a control you cannot see the edge of is a
   * control nobody grabs.
   */
  balloonHandleMilli: number;
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
  balloonClimbBeats: 2,
  balloonSplits: 1,
  balloonTautMilli: 2000,
  balloonHoldBeats: 1,
  balloonHandleMilli: 1150,
  scoreBalloonRub: 120,
  scoreBalloonPop: 100,
};
