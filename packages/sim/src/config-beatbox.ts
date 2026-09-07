/**
 * THE BEATBOX's numbers: how many beats one asks for, how near the beat a tap
 * has to land, what a wrong count costs the hull and what a right one is worth
 * (`beatbox.ts`).
 *
 * `SimConfig` extends this rather than nesting it, for the reason
 * `config-choir.ts` and `config-recoil.ts` already give: every call site still
 * reads `cfg.beatboxWindowMs`, and the split is only about how much of one
 * file a reader has to hold at once.
 *
 * **Its own file rather than four more rows in `config-creatures.ts`.** The
 * four are decided **together**: how long the run is and how wide each beat's
 * window is are one decision about how hard the rhythm is, and what a miss
 * costs only means anything against what a hit pays. A reader who moves one
 * has to move the others.
 */
export interface BeatboxConfig {
  /**
   * How many beats a box asks for when the wave names no count. Three: the
   * shortest run that is still a *rhythm* rather than a press. At one the pair
   * is not counting anything, at two the pilot's word and the navigator's
   * thumb overlap, and three is where the sentence — *three!* — is said,
   * heard and then acted on over three separate beats.
   *
   * A wave may author any count (`SpawnEntry.beats`); this is what it gets for
   * saying nothing, and it is deliberately the count the guide teaches.
   */
  beatboxBeats: number;
  /**
   * How near a beat a tap has to land to count, in milliseconds, either side.
   * 200 at the config's 96 BPM is 400 ms of a 625 ms beat — wide enough that a
   * thumb on glass is not being asked for studio timing, and narrow enough
   * that it cannot reach two beats at once, which is what makes "which beat
   * was that tap for" a question with one answer (`beatboxBeatFor`).
   *
   * **It must stay under half a beat.** At or over it the windows of
   * neighbouring beats overlap and one tap would answer both;
   * `packages/sim/test/beatbox.test.ts` holds this number to that.
   */
  beatboxWindowMs: number;
  /**
   * What the wave of sound costs the hull when a run locks in on the wrong
   * count. Below `damageCreature`, on `damageChoirSong`'s terms and for its
   * reason: a body that reached the ship has beaten the pair and a miscounted
   * run has only cost them the box, which is still coming down.
   */
  damageBeatboxWave: number;
  /**
   * What one silenced box is worth. `scoreChoirMerge`'s figure exactly, and
   * the pairing is the argument: both are a body answered by a gesture that is
   * on no panel, both need one seat to say a thing the other cannot see, and
   * two prices for one shape of moment would say the two moments are
   * different.
   */
  scoreBeatboxSilence: number;
}

/** The defaults, spread into `DEFAULT_CONFIG`. */
export const BEATBOX_DEFAULTS: BeatboxConfig = {
  beatboxBeats: 3,
  beatboxWindowMs: 200,
  damageBeatboxWave: 8,
  scoreBeatboxSilence: 120,
};
