/**
 * What THE RATCHET says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The rack stands down the middle of the field, so all of them but
 * the bolt's are heard in the middle.
 *
 * **A burned tooth says so.** §22 asked for it to be silent; it is a dull
 * thud instead, because a press on glass that answers nothing reads as a tap
 * the phone missed, and the pilot would press again and burn a second
 * (`docs/spec/bosses.md` §11.38).
 */

interface RatchetColEvent {
  /** The column it happened over. */
  col: number;
}

export type RatchetEvent =
  /** The rack swings in over the field, seven teeth showing and the catch unset. */
  | ({ type: "ratchetEnter" } & RatchetColEvent)
  /** A pawl lights; `teeth` is what the rack still has. */
  | ({ type: "ratchetLit"; teeth: number } & RatchetColEvent)
  /** The navigator set the catch. */
  | ({ type: "ratchetSet" } & RatchetColEvent)
  /** She let the catch go before a press came. */
  | ({ type: "ratchetLet" } & RatchetColEvent)
  /** A press with the catch set: one tooth up, clean. */
  | ({ type: "ratchetClick"; teeth: number; clean: number } & RatchetColEvent)
  /** A tooth spent for nothing — a press with no catch, or `late`, a window nobody pressed in. */
  | ({ type: "ratchetBurn"; teeth: number; late: boolean } & RatchetColEvent)
  /** The second clean advance shakes a bolt loose — the fight's one hazard. */
  | ({ type: "ratchetBolt" } & RatchetColEvent)
  /** The bolt was shot out, in either colour. */
  | ({ type: "ratchetBoltOut" } & RatchetColEvent)
  /** Nobody shot it: the bolt reached the hull, which is the wave. */
  | ({ type: "ratchetBoltHit" } & RatchetColEvent)
  /** Five clean: the catch at the top gives and the rack folds away. */
  | ({ type: "ratchetOpen" } & RatchetColEvent)
  /** Five clean is out of reach: the rack jams into the hull, which is the wave. */
  | ({ type: "ratchetJam" } & RatchetColEvent)
  /** The open rack has hung `ratchetOpenBeats`; the wave may end. */
  | ({ type: "ratchetOut" } & RatchetColEvent);
