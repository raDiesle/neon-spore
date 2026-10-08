import type { GallAsk } from "./gall.js";

/**
 * What THE GALL says as it happens, one line per thing the picture and the
 * sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to: the gall's point for what happens to the gall, the middle for the
 * root and the seam as a whole. A point is `point`, nought at the left end.
 */

interface GallColEvent {
  /** The column it happened over. */
  col: number;
}

export type GallEvent =
  /** The seam rises into frame with the gall slack on its first point. */
  | ({ type: "gallEnter"; point: number } & GallColEvent)
  /** A step lit: the gall to be pressed shut where it sits, or the root to shoot. */
  | ({ type: "gallLight"; ask: GallAsk; point: number } & GallColEvent)
  /** A press on the gall's point came shut: the count begins. */
  | ({ type: "gallPress"; point: number } & GallColEvent)
  /** The shut press widened before the count was done: it starts again. */
  | ({ type: "gallSlip"; point: number } & GallColEvent)
  /** A close landed and the gall jumped `from` one point `to` another; `closes` so far. */
  | ({ type: "gallClose"; from: number; to: number; closes: number } & GallColEvent)
  /** A close window ran out: the gall swells back, to be pressed again where it sits. */
  | ({ type: "gallSwell"; point: number } & GallColEvent)
  /** The last close landed and the root lies bare. */
  | ({ type: "gallBare" } & GallColEvent)
  /** The root shot in its colour; `hits` is how many it has taken. */
  | ({ type: "gallHit"; hits: number } & GallColEvent)
  /** A fire step ran out with the root unshot: the hull takes it. */
  | ({ type: "gallMiss" } & GallColEvent)
  /** The script is done and the seam smooths flat. */
  | ({ type: "gallFlat" } & GallColEvent)
  /** The flat seam has stood `gallFlatBeats`; the wave may end. */
  | ({ type: "gallOut" } & GallColEvent);
