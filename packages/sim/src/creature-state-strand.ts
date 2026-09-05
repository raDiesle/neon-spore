/**
 * **THE STRAND's three fields**, and the whole of what one bead remembers.
 *
 * Its own file rather than three more entries in `creature-state.ts`, which
 * was one line under the 250-line limit the day this creature was written —
 * the immediate reason, and the same one `config-veer.ts` and `config-ghost.ts`
 * each record for themselves. The better reason is the one those files also
 * give: these three only mean anything against each other. An identity with no
 * order says nothing about which bead is next, an order with no identity says
 * nothing about which thread it is next *on*, and neither says whether this
 * one is still alive.
 *
 * `CreatureState extends StrandState`, so every call site still reads
 * `c.strandOrder` and nothing moved. It is the arrangement `HeldState` next
 * door already has, and the split is only about how much of one file a reader
 * has to hold at once.
 *
 * **Absent is a value here, as it is everywhere in `creature-state.ts`.** A
 * body that is not a bead carries none of the three, so every wave written
 * before this creature is byte-for-byte the same world. None of them may be
 * read directly — `beadStrand`, `beadOrder` and `beadIsSpent` in `strand.ts`
 * are the rules, and a second spelling of a fallback is how the thread render
 * draws and the shot the simulation allows come to disagree about which bead
 * is lit.
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
   * Where this bead stands in the **shooting order**: 0 is the one that has to
   * go first, and the count runs along the thread from there.
   *
   * It is not the same thing as where the bead stands on the field, and that
   * gap is the creature. Which end of the thread the order starts at is rolled
   * on the beat the strand arrives (`stringStrand`), so a bead's order is
   * either its place from the left or its place from the right and nothing on
   * either screen says which — player 2 is shown the lit bead and player 1 is
   * not.
   *
   * It also fixes the colour, which is why the two are not two facts: the
   * beads alternate along the order (`beadColor`), so the head carries the
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
}
