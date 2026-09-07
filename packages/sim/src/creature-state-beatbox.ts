/**
 * **THE BEATBOX's three fields**, and the whole of what one box remembers: how
 * many beats it is asking for, how many taps have landed, and the beat the
 * last one landed on.
 *
 * Its own file rather than three more entries in `creature-state.ts`, and for
 * `creature-state-fence.ts`'s reason with rather more of it: these three only
 * mean anything against each other. Whether the run is still open is the last
 * two compared against the shared beat (`beatboxBroke`), and whether it was
 * right is the first two compared against one another (`beatboxCorrect`) —
 * neither question can be asked of any one of them alone.
 *
 * `CreatureState extends BeatboxState`, so every call site still reads
 * `c.beatboxHits` and nothing moved.
 */
export interface BeatboxState {
  /**
   * How many beats this box is asking for, and absent on every other kind.
   * Authored by the wave and never rolled (`SpawnEntry.beats`), for
   * `SpawnEntry.wears`' reason: this number **is** the sentence one player has
   * to say to the other, and a wave cannot be composed against a sentence its
   * author does not know.
   *
   * Never absent on a live box: `beatboxOnSpawn` writes the config's own count
   * for a wave that named none, so absent means *not a beatbox* and nothing
   * else. Read it through `beatboxWanted` and never directly — the number
   * player 1 is shown and the count the lock-in is judged against are one
   * fact, and a second spelling of the fallback is how the two come apart.
   */
  beatboxWant?: number;
  /**
   * How many taps have landed on the beat so far, and absent on a box nobody
   * has touched yet. It is the run: at the lock-in it is compared with
   * `beatboxWant` and the box is either silenced or fires.
   *
   * Read it through `beatboxHitsMade`, never directly. Absent and zero mean
   * the same thing — a box standing there untouched — and a site that spelled
   * that fallback again is a site where the tally player 2 is counting and the
   * count the simulation judges can disagree.
   */
  beatboxHits?: number;
  /**
   * The beat the last tap landed on, and absent on a box nobody has touched.
   * With the count above it is the whole of "is this run still going": a beat
   * that passed with no tap on it ends the run (`beatboxBroke`).
   *
   * A moment and not a countdown, for `Creature.veilStruckTick`'s reason: the
   * grace is a length the config owns, and a stored number ticking down would
   * be a second copy of it that can disagree — the swell render draws and the
   * beat the simulation locks in on are one fact.
   *
   * It is the beat a tap was *for* rather than the beat it arrived on, which
   * are not the same thing: a thumb inside the window ahead of a beat boundary
   * is early rather than late, and it answers the beat it was reaching for
   * (`beatboxBeatFor`).
   */
  beatboxBeat?: number;
}
