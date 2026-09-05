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
 * There is exactly one creature in it today. That is not a reason to fold it
 * back in: a hand is a control rather than a creature, and the next body a
 * finger can be put on belongs here beside the lid rather than in the middle
 * of a list of things that fall.
 */
export interface HeldState {
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
  /** Where the handle was when the hand took it, held there until the hand lets
   * go: the handle is this plus the pull, which is what keeps it under the
   * finger while the body falls away (`lidHandleMilli`). Absent unheld. */
  lidAnchorMilli?: number;
  lidAnchorYMilli?: number;
}
