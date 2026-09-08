/**
 * **THE BEATBOX's five fields**, and the whole of what one box remembers: how
 * many beats it is asking for, how many taps have landed, the beat the last
 * one landed on, and the two ticks the picture is timed from — the last thumb
 * that counted and the last discharge.
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
  /**
   * The tick the last accepted tap arrived on, and absent on a box nobody has
   * touched.
   *
   * **A tick and not a beat, and it is the only field here that is.** The
   * three above are the *rules* and are counted in beats, because a run is a
   * thing made of beats. This one is the *picture*: the glow that says the
   * press was seen, the ring of green that goes out of the body on a beat that
   * counted, and how far the newest arm has grown out of the rim. All three
   * start at the thumb rather than at the boundary, and a thumb may land a
   * fifth of a second either side of one (`beatboxWindowTicks`) — timed off
   * `beatboxBeat` they would start before the press on an early tap and after
   * it on a late one, which is a receipt that arrives at the wrong moment on
   * the one creature whose whole subject is *when*.
   *
   * Read it through `beatboxTapAge`. It is in the fingerprint like everything
   * else a body carries: it changes nothing about the rules, and a field
   * outside the fingerprint is a field that can desync two devices silently
   * (CLAUDE.md rule 4).
   */
  beatboxTick?: number;
  /**
   * The tick the box last discharged on, and absent on one that never has.
   *
   * The other half of the picture, and the field the owner's *when the player
   * didn't hit the beat, it should colour in some red* is drawn from: for a
   * short while after a run comes apart the body is lit red and throws red
   * rings, and then it goes back to being an ordinary box with the height it
   * has left. `beatboxHits` cannot carry that — it is wiped by the same
   * discharge, so by the frame after there is nothing left on the body saying
   * anything went wrong.
   *
   * Deliberately **not** cleared. It is a moment rather than a state, for
   * `beatboxBeat`'s own reason: how long the red lasts is render's to decide,
   * and a stored flag turned off by the simulation would be a second copy of
   * that length that can disagree with the one drawing it.
   */
  beatboxWrong?: number;
}
