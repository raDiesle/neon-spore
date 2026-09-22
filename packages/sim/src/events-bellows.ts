/**
 * What THE BELLOWS says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the waist is the middle of the field and the two chambers hang off
 * it, so a thing one seat did is heard where that seat's chamber is
 * (`bellowsChamberCol`) and a thing the lung did is heard in the middle.
 *
 * **The jam has its own word and it names the seat that caused it.** It is
 * the fight's one fault and the whole point of the fight is knowing whose
 * turn it was, so a sound that said *wrong* without saying *yours* would take
 * away the only thing the pair has to talk about.
 */

interface BellowsColEvent {
  /** The column it happened over. */
  col: number;
}

export type BellowsEvent =
  /** The lung swings in across the top of the field, waist tight, four seams whole. */
  | ({ type: "bellowsEnter" } & BellowsColEvent)
  /** An exchange's marks light, his first; `seams` is what the waist still has. */
  | ({ type: "bellowsMarks"; seams: number } & BellowsColEvent)
  /** The pilot drew his chamber open: her beat, and the exchange is half done. */
  | ({ type: "bellowsPulled" } & BellowsColEvent)
  /** A clean pull-then-push: a seam parts and `seams` is what is left. */
  | ({ type: "bellowsSeam"; seams: number } & BellowsColEvent)
  /** `player` worked a handle in the other seat's beat: both jam, and nothing parts. */
  | ({ type: "bellowsJam"; player: 1 | 2 } & BellowsColEvent)
  /** The shared window ran out with the exchange half done: both jam. */
  | ({ type: "bellowsLate" } & BellowsColEvent)
  /** A spark leaks from the new gap — the fight's first ordinary hazard. */
  | ({ type: "bellowsSpark" } & BellowsColEvent)
  /** The spark was shot out, in either colour, and the ribs steady. */
  | ({ type: "bellowsSparkOut" } & BellowsColEvent)
  /** Nobody shot it: the spark reached the hull, which is the wave. */
  | ({ type: "bellowsSparkHit" } & BellowsColEvent)
  /** The lung forces a breath of its own straight down the pilot's column. */
  | ({ type: "bellowsBreath" } & BellowsColEvent)
  /** The last seam, and both handles glowing together for the first time. */
  | ({ type: "bellowsGlow" } & BellowsColEvent)
  /** `player` took hold of its handle, in any phase that has one to take. */
  | ({ type: "bellowsGrip"; player: 1 | 2 } & BellowsColEvent)
  /** Both let go inside a beat of each other: the waist splits clean in two. */
  | ({ type: "bellowsSplit" } & BellowsColEvent)
  /** One handle was held a beat longer than the other, and the last seam holds. */
  | ({ type: "bellowsHold" } & BellowsColEvent)
  /** The two halves fall apart, venting the whole held breath across the field. */
  | ({ type: "bellowsVent" } & BellowsColEvent)
  /** The vent has hung `bellowsVentBeats`; the wave may end. */
  | ({ type: "bellowsOut" } & BellowsColEvent);
