/**
 * What THE GIMBAL says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the drum hangs in the middle of the field and so does everything
 * about it except the seam, which leaks where it leaks.
 *
 * **The two faults have their own words** and neither says which ring: the
 * slip is the pair losing an alignment they had, and the seam reaching the
 * hull is the one ordinary hazard going unanswered. A sound that said *wrong*
 * for both would tell the pair nothing about which of them to look at.
 */

interface GimbalColEvent {
  /** The column it happened over. */
  col: number;
}

export type GimbalEvent =
  /** The drum drops into frame between the two dark, still rings. */
  | ({ type: "gimbalEnter" } & GimbalColEvent)
  /** Alignment `index`'s marks light, each on its own seat's screen alone. */
  | ({ type: "gimbalMarks"; index: number } & GimbalColEvent)
  /** Both rings came true together: the hold has begun and both rings glow. */
  | ({ type: "gimbalTrue" } & GimbalColEvent)
  /** A ring left its mark before the hold was up, and the alignment is lost. */
  | ({ type: "gimbalSlip" } & GimbalColEvent)
  /** A tooth pair shears, one off each ring; `teeth` is what is left on each. */
  | ({ type: "gimbalShear"; teeth: number } & GimbalColEvent)
  /** The drum swings loose and a spark leaks from its seam. */
  | ({ type: "gimbalLeak" } & GimbalColEvent)
  /** The leaking seam was shot out, in either colour, and the rings steady. */
  | ({ type: "gimbalSeamOut" } & GimbalColEvent)
  /** Nobody shot it: the spark reached the hull, which is the wave. */
  | ({ type: "gimbalSeamHit" } & GimbalColEvent)
  /** The last tooth pair gone: both rings spin free and the drum splits open. */
  | ({ type: "gimbalHatch" } & GimbalColEvent)
  /** The hatch has hung `gimbalOpenBeats`; the wave may end. */
  | ({ type: "gimbalOut" } & GimbalColEvent);
