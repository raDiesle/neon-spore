/**
 * **THE STRAND's four fields**, and the whole of what one bead remembers.
 *
 * Its own file rather than four more entries in `creature-state.ts`, which was
 * one line under the 250-line limit the day this creature was written — the
 * immediate reason, and the same one `config-veer.ts` and `config-ghost.ts`
 * each record for themselves. The better reason is the one those files also
 * give: these only mean anything against each other. An identity with no place
 * says nothing about which bead is which, a place with no identity says
 * nothing about which thread it is on, and neither says whether this one is
 * still alive or whether it is the one a shot may land on.
 *
 * `CreatureState extends StrandState`, so every call site still reads
 * `c.strandOrder` and nothing moved. It is the arrangement `HeldState` next
 * door already has, and the split is only about how much of one file a reader
 * has to hold at once.
 *
 * **Absent is a value here, as it is everywhere in `creature-state.ts`.** A
 * body that is not a bead carries none of the four, so every wave written
 * before this creature is byte-for-byte the same world. None of them may be
 * read directly — `beadStrand`, `beadOrder`, `beadIsSpent` and `beadIsLit` in
 * `strand.ts` are the rules, and a second spelling of a fallback is how the
 * thread render draws and the shot the simulation allows come to disagree
 * about which bead is next.
 */
export interface StrandState {
  /**
   * Which strand this bead is threaded on, and **its presence is being one**.
   * The id of the bead that arrived first — the leftmost — which is a name
   * that outlives every death on the thread, because a bead shot dead stays
   * hanging on it until the whole strand goes (`breakSpentStrands`).
   *
   * Read it through `beadStrand`. Render groups a thread by this field and
   * `strandHead` counts the same one to decide which bead may be shot, so a
   * second spelling of the fallback is a picture and a rule about two
   * different creatures.
   */
  strandId?: number;
  /**
   * Where this bead hangs **along the thread**: 0 at the leftmost, counting
   * right. It is a place and not an order — which end the pair has to shoot
   * from is `strandLit` below, and it moves.
   *
   * It fixes the colour, which is why the two are not two facts: the beads
   * alternate along the thread (`beadColor`), so the leftmost carries the
   * authored colour and every neighbour is the other one.
   */
  strandOrder?: number;
  /**
   * Whether this bead has already been shot. A shrivelled bead — a raisin —
   * still hangs on the thread: it is what both seats count the strand's
   * progress off, and it is the reason a wrong shot has something to undo
   * (`beadStruck`).
   *
   * Absent and `false` are one state, which is right: a bead arrives alive, so
   * "no field yet" *is* "still to be shot". Read it through `beadIsSpent`.
   */
  strandSpent?: boolean;
  /**
   * Whether this is the bead a shot may land on. **Exactly one live bead of a
   * thread carries it**, and it is always at one end of what is left alive —
   * `lightStrandEnd` is the only thing that writes it, and it clears the whole
   * thread before setting one.
   *
   * **Stored rather than derived, and it is the one thing here that has to
   * be.** It was "the live bead lowest in a fixed order" for a day, which
   * derived beautifully and gave the creature away: the first raisin shows the
   * pilot which end the order started at, and from there they know every bead
   * that follows without being told. So the end is rolled again after every
   * change to the thread, and a roll is not a thing a field can be derived
   * from. It is `dartNext`'s arrangement — a side decided ahead of time and
   * written down, with `rng.state` in `hash.ts` making both devices roll it
   * the same way.
   *
   * Read it through `beadIsLit`, and ask `beadIsActive` for the question the
   * mark and the shot both really have.
   */
  strandLit?: boolean;
}
