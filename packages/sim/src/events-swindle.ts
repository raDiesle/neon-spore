/**
 * What THE SWINDLE says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. A piece is `piece`, a pod's index in the lit hand's own order.
 * **No event before the receipt says whether a pod is real**: the sound is
 * heard on both screens, and a hang, a swap or a drop that told the two apart
 * would be the tell the pilot's picture is careful not to give.
 */

interface SwindleColEvent {
  /** The column it happened over. */
  col: number;
}

export type SwindleEvent =
  /** She comes in over the field; `pods` is every real pod she will deal. */
  | ({ type: "swindleEnter"; pods: number } & SwindleColEvent)
  /** A hand is hung in a row: `pods` of them, real and hollow. */
  | ({ type: "swindleHang"; pods: number } & SwindleColEvent)
  /** Two pods begin to trade places, from `col` to `to` and back. */
  | ({ type: "swindleSwap"; to: number } & SwindleColEvent)
  /** She lets a pod go. */
  | ({ type: "swindleDrop"; piece: number } & SwindleColEvent)
  /** A real pod of hers was swallowed; `left` real pods still to come. */
  | ({ type: "swindleTaken"; piece: number; left: number } & SwindleColEvent)
  /** A husk of hers was refused. */
  | ({ type: "swindleRefused"; piece: number } & SwindleColEvent)
  /** Nothing of the lit hand is left on the field: she rears back. */
  | ({ type: "swindleCleared"; level: number } & SwindleColEvent)
  /** Her last hand is cleared: she is beaten. */
  | ({ type: "swindleSpent" } & SwindleColEvent)
  /** She is gone; the wave may end. */
  | ({ type: "swindleOut" } & SwindleColEvent);
