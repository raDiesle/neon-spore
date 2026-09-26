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
  | ({ type: "ratchetOut" } & RatchetColEvent)
  // The story between the teeth (`ratchet-story.ts`): each state opens, is
  // won, or runs out against the hull and opens again.
  /** After the first clean tooth the rack sags back toward the catch. */
  | ({ type: "ratchetSlip" } & RatchetColEvent)
  /** The catch held: it bites and the rack stops sagging. */
  | ({ type: "ratchetBite" } & RatchetColEvent)
  /** The slip ran out: the rack drops against the hull. */
  | ({ type: "ratchetDrop" } & RatchetColEvent)
  /** After the second the spring kicks the pawl out of its seat. */
  | ({ type: "ratchetKick" } & RatchetColEvent)
  /** The pawl held down: it seats with a clunk. */
  | ({ type: "ratchetSeat" } & RatchetColEvent)
  /** The kick ran out: the pawl flies against the hull. */
  | ({ type: "ratchetFly" } & RatchetColEvent)
  /** After the third the teeth grind and the rack shakes on its strut. */
  | ({ type: "ratchetBind" } & RatchetColEvent)
  /** Both held: the teeth mesh. */
  | ({ type: "ratchetMesh" } & RatchetColEvent)
  /** The bind ran out: the strut shakes a plate loose against the hull. */
  | ({ type: "ratchetShake" } & RatchetColEvent)
  /** After the fourth the spring has run down. */
  | ({ type: "ratchetWind" } & RatchetColEvent)
  /** Set enough times: the spring is wound tight. */
  | ({ type: "ratchetWound" } & RatchetColEvent)
  /** The wind ran out: the spring unwinds against the hull. */
  | ({ type: "ratchetUnwind" } & RatchetColEvent);
