/**
 * **The state a hand writes**, as opposed to the state the beat writes.
 *
 * Split out of `creature-state.ts` when THE VEER took that file past its
 * 250-line limit, and this is the one seam that file has. Everything left next
 * door is written by the simulation's own clock — a dart takes its diagonal on
 * the beat, a veil turns over on the beat, an echo divides on the beat — and
 * the reader of any of those fields is asking *what has the world done to this
 * body*. These four are the answer to a different question: **where is player
 * 1's thumb**. They are written by `touchDown` and `touchMove`, they are the
 * only creature fields a command writes directly, and every one of them is
 * gone the instant the finger lifts.
 *
 * `CreatureState extends HeldState` rather than nesting it under a key, so
 * every call site still reads `c.lidPullMilli` and nothing moved — the same
 * arrangement `SimConfig` has with `CreatureConfig` and the rest.
 *
 * THE LID was alone here for a while; THE GUM is the second, and the first
 * whose hand is **player 2's** — the heading above says player 1 because that
 * was true of every field when it was written, and the seam is still the
 * right one: a hand is a control rather than a creature, and a body a finger
 * can be put on belongs here rather than in the middle of a list of things
 * that fall.
 */
export interface HeldState {
  /**
   * **Dropped by THE CLAW's arm**, and absent on every body that was not.
   *
   * The arm closes on whatever it meets, and what it meets is not always the
   * power-up somebody named. A body it catches is not crushed — it is let go,
   * from wherever it was caught, and from that moment it comes down at the
   * torch's speed and hits the ship like one (`fallTilesPerBeat`,
   * `grippedFallTiles`). That is the whole price of reaching into a lane with
   * a rock in it: the rock is not removed, it is *hurried*, and the pair get
   * it in the face a great deal sooner than they would have.
   *
   * A flag rather than a change of kind, because the thing is still whatever
   * it was — a slick dropped is a slick, and shooting it on the way down still
   * works. Absent rather than `false` so a wave of bodies nobody has touched
   * is byte-for-byte the wave it always was.
   */
  dropped?: boolean;
  /**
   * How far player 1's hand has carried THE LID's cord from where it grabbed,
   * across and down, in thousandths of a tile — and **absent on a lid nobody
   * has hold of**, which is what makes the absence itself the answer to "is a
   * hand on this": a grab reports zero, so nought and nothing are two states.
   * The two together are the pull and its **length** is the tension. Read them
   * through `lidPull`, `lidOpenMilli`, `lidIsOpen` and `lidIsHeld`, never
   * directly; `handle-pull.ts` is what bounds them.
   */
  lidPullMilli?: number;
  lidPullYMilli?: number;
  /**
   * **THE GUM is on the ship.** Set once, on the beat it is drawn standing
   * on the hull, and never cleared: a gum leaves the field by being flung and
   * no other way. Absent on a gum still falling, which is a body a hand does
   * nothing to. Read through `gumIsStuck` (`gum.ts`).
   */
  gumStuck?: true;
  /**
   * How far **player 2's** hand has carried a stuck gum from where it
   * grabbed, across, in thousandths of a tile — and absent on one nobody has
   * hold of, the lid's arrangement exactly: a grab reports zero, so nought
   * and nothing are two states. Nought also while the cannon is not under
   * it, so a gum that will not budge is drawn not budging. Read through
   * `gumPull` and `gumIsHeld`; `gum.ts` is what bounds it.
   */
  gumPull?: number;
  /**
   * This grab has already spread the gum, and may not act again until the
   * hand lifts. Absent otherwise. Without it a hand that kept pushing the
   * wrong way would spread the gum a lane further on every message.
   */
  gumSpent?: true;
  /**
   * **THE LIMPET or THE LEECH has its control.** Set once, on the beat it is
   * drawn standing on the hull, and never cleared: one leaves the field by
   * being shaken off or by going off, and no other way. Absent on one still
   * falling. Read through `clingIsStuck` (`cling.ts`).
   */
  clingStuck?: true;
  /** Beats the control has now stood in one column under it; nought again
   * on a move. The fuse: `limpetStillBeats` of them and it goes off. */
  clingStill?: number;
  /** Beats the control was found in a new column, counted once per beat;
   * `limpetShakeMoves` of them and it lets go. */
  clingMoves?: number;
  /** The control's column a beat ago, which the beat's column is judged
   * against. Absent on one still falling. */
  clingLastCol?: number;
  /**
   * **Ticks both seats have had a hand on THE WEIGHT at once**, and absent on
   * one nobody is pressing with both hands.
   *
   * Ticks rather than beats, and counted on the body rather than on the world,
   * for the same reason THE BALLOON's pulls are: the pair counts itself into
   * the instant both thumbs land, and an instant answered on the next beat
   * would arrive up to a whole beat after the one they said out loud. A field
   * per weight, because a wave may send two down and each is being pressed or
   * not on its own.
   *
   * It goes back to absent the moment either hand lifts — a press half made is
   * no press at all, which is what makes the coordination the creature rather
   * than a stopwatch. Read it through `weightPressTicks` and `weightPressFrac`
   * in `weight.ts`, never by name.
   */
  weightPressTicks?: number;
}
