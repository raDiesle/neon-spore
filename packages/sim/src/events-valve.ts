/**
 * What THE VALVE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The drum stands in the middle, so all but the spark's are there.
 */

interface ValveColEvent {
  /** The column it happened over. */
  col: number;
}

export type ValveEvent =
  /** The drum settles into frame, every pin in. */
  | ({ type: "valveEnter" } & ValveColEvent)
  /** A movement's mark lights on the rim; the wheel is the pilot's to turn. */
  | ({ type: "valveLight"; movement: 1 | 2 | 3 } & ValveColEvent)
  /** The wheel came onto its mark: the freeze window opens. */
  | ({ type: "valveHold" } & ValveColEvent)
  /** The wheel was turned off its mark before the tap. */
  | ({ type: "valveSlip" } & ValveColEvent)
  /** The freeze window ran out untapped: the wheel is kicked off its mark. */
  | ({ type: "valveLapse" } & ValveColEvent)
  /** The navigator's tap landed: the wheel stops dead. */
  | ({ type: "valveFreeze" } & ValveColEvent)
  /** The pull window ran out: the wheel thaws and is kicked off its mark. */
  | ({ type: "valveThaw" } & ValveColEvent)
  /** A pin came out; `pins` is how many are left in. */
  | ({ type: "valvePull"; pins: number } & ValveColEvent)
  /** The first pin out leaked a spark down the drum's column. */
  | ({ type: "valveSpark" } & ValveColEvent)
  /** The spark was shot out, in either colour. */
  | ({ type: "valveSparkOut" } & ValveColEvent)
  /** Nobody shot it: the spark reached the hull. */
  | ({ type: "valveSparkHit" } & ValveColEvent)
  /** The last pin is out: the face falls open. */
  | ({ type: "valveOpen" } & ValveColEvent)
  /** The open face has hung `valveOpenBeats`; the wave may end. */
  | ({ type: "valveOut" } & ValveColEvent);
