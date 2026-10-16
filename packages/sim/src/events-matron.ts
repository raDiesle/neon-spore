import type { MatronThrowKind } from "./matron.js";

/**
 * What THE MATRON says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. A piece is `piece`, a pod's index in the lit clutch's own order.
 */

interface MatronColEvent {
  /** The column it happened over. */
  col: number;
}

export type MatronEvent =
  /** She comes down over the field; `lobes` is every pod she will hang. */
  | ({ type: "matronEnter"; lobes: number } & MatronColEvent)
  /** A clutch is hung off her lobes: `pods` of them. */
  | ({ type: "matronHang"; pods: number } & MatronColEvent)
  /** She throws something down a column. */
  | ({ type: "matronThrow"; what: MatronThrowKind } & MatronColEvent)
  /** A pod of hers was swallowed, and its lobe went with it; `left` lobes on her. */
  | ({ type: "matronLobe"; piece: number; left: number } & MatronColEvent)
  /** The lit clutch's last pod is swallowed: she rears back. */
  | ({ type: "matronCleared"; level: number } & MatronColEvent)
  /** Her last pod is swallowed: she is beaten. */
  | ({ type: "matronSpent" } & MatronColEvent)
  /** She is gone; the wave may end. */
  | ({ type: "matronOut" } & MatronColEvent);
