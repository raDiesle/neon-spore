import type { OculusAsk } from "./oculus.js";

/**
 * What THE OCULUS says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. The lens hangs over the middle, so every one is there.
 */

interface OculusColEvent {
  /** The column it happened over. */
  col: number;
}

export type OculusEvent =
  /** The lens settles into frame, every leaf open. */
  | ({ type: "oculusEnter" } & OculusColEvent)
  /** A step lit: a pair to shut, a shot at the core, the socket to hold open, a glare or a look. */
  | ({ type: "oculusLight"; ask: OculusAsk } & OculusColEvent)
  /** A thumb lifted while both leaves were down: the count starts over. */
  | ({ type: "oculusSlip" } & OculusColEvent)
  /** A pair of leaves held shut; `shut` is how many are shut now. */
  | ({ type: "oculusShut"; shut: number } & OculusColEvent)
  /** A shut step ran out: the pair springs open, to be tried again. */
  | ({ type: "oculusSpring" } & OculusColEvent)
  /** The leaves are all shut and the socket cracks open. */
  | ({ type: "oculusBreak" } & OculusColEvent)
  /** The core shot in its colour; `hits` is how many it has taken. */
  | ({ type: "oculusHit"; hits: number } & OculusColEvent)
  /** The socket held open against its reseal. */
  | ({ type: "oculusReseal" } & OculusColEvent)
  /** A reseal step ran out: the socket swallows itself, to be held again. */
  | ({ type: "oculusSwallow" } & OculusColEvent)
  /** The glare met by the shield under the eye. */
  | ({ type: "oculusBlock" } & OculusColEvent)
  /** The look answered by a shot up the column the eye looks down; `col` is that column. */
  | ({ type: "oculusGlance" } & OculusColEvent)
  /** A fire, glare or look step ran out unanswered: the hull takes it. */
  | ({ type: "oculusMiss" } & OculusColEvent)
  /** The script is done and the lens shatters. */
  | ({ type: "oculusShatter" } & OculusColEvent)
  /** The shattered lens has fallen `oculusShatterBeats`; the wave may end. */
  | ({ type: "oculusOut" } & OculusColEvent);
