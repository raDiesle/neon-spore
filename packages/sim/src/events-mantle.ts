/**
 * What THE MANTLE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the shell hangs in the middle of the field and so does everything
 * about it except the bared core's spark, which leaks where it leaks.
 */

interface MantleColEvent {
  /** The column it happened over. */
  col: number;
}

export type MantleEvent =
  /** The shell drops into frame, closed, both handles dark. */
  | ({ type: "mantleEnter" } & MantleColEvent)
  /** The next movement's handles light. */
  | ({ type: "mantleLight" } & MantleColEvent)
  /** The summed pull crossed the movement's threshold: a plate-pair shears;
   * `left` is how many pairs remain. */
  | ({ type: "mantleShear"; left: number } & MantleColEvent)
  /** The shell fully split: the bare core is showing. */
  | ({ type: "mantleSplit" } & MantleColEvent)
  /** The last pair is next: the seam glows and the shell shudders, asking
   * for both handles held still. */
  | ({ type: "mantleGlow" } & MantleColEvent)
  /** A hand lifted mid-brace: the shudder worsens and the hold starts over. */
  | ({ type: "mantleSlip" } & MantleColEvent)
  /** The brace held `mantleBraceBeats`: the shudder settles. */
  | ({ type: "mantleSteady" } & MantleColEvent)
  /** The last pair's window ran out unsheared: it resets, and asks again. */
  | ({ type: "mantleLapse" } & MantleColEvent)
  /** The core's spark leaks, unanswered. */
  | ({ type: "mantleLeak" } & MantleColEvent)
  /** The leaking spark was shot out, in either colour. */
  | ({ type: "mantleSparkOut" } & MantleColEvent)
  /** Nobody shot it: the spark reached the hull, which is the wave. */
  | ({ type: "mantleSparkHit" } & MantleColEvent)
  /** A correct alternating tap landed; `left` is how many the finish still needs. */
  | ({ type: "mantleBeat"; left: number } & MantleColEvent)
  /** The last tap landed: the core goes dark and the fight ends. */
  | ({ type: "mantleDark" } & MantleColEvent)
  /** The dark core has hung `mantleOpenBeats`; the wave may end. */
  | ({ type: "mantleOut" } & MantleColEvent);
