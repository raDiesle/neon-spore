import type { ChrysalisSkin } from "./chrysalis.js";

/**
 * What THE CHRYSALIS says as it happens, one line per thing the picture and
 * the sound answer.
 *
 * Every event carries `col`, the column it happened over, for the sounds to
 * pan to. A seat is `seat`, nought the pilot; a piece is `piece`, its index in
 * the lit skin's own order.
 */

interface ChrysalisColEvent {
  /** The column it happened over. */
  col: number;
}

export type ChrysalisEvent =
  /** The cocoon comes in over the field. */
  | ({ type: "chrysalisEnter" } & ChrysalisColEvent)
  /** A skin lit: which. */
  | ({ type: "chrysalisSkin"; skin: ChrysalisSkin } & ChrysalisColEvent)
  /** A turn of the rub on a half of the slime; `rubbed` its turns so far. */
  | ({ type: "chrysalisRub"; seat: 0 | 1; rubbed: number } & ChrysalisColEvent)
  /** A half of the slime rubbed clear. */
  | ({ type: "chrysalisWipe"; seat: 0 | 1; piece: number } & ChrysalisColEvent)
  /** A quill pulled out far enough rips free; `seat` pulled it. */
  | ({ type: "chrysalisRip"; seat: 0 | 1; piece: number } & ChrysalisColEvent)
  /** A quill let go before it ripped, or carried off its curve, snaps back and starts over. */
  | ({ type: "chrysalisSnap"; seat: 0 | 1; piece: number } & ChrysalisColEvent)
  /** A thumb went down on the partner's half, and took hold of nothing. */
  | ({ type: "chrysalisWrong"; seat: 0 | 1 } & ChrysalisColEvent)
  /** A sac begins to swell over its column. */
  | ({ type: "chrysalisSwell"; piece: number } & ChrysalisColEvent)
  /** The shield met a sac's spores and threw them back: the sac bursts. */
  | ({ type: "chrysalisBurst"; piece: number } & ChrysalisColEvent)
  /** A sac sprayed with no shield under it; it swells again. */
  | ({ type: "chrysalisSpray"; piece: number } & ChrysalisColEvent)
  /** A bolt in the heart's colour went into it; the next beat comes up somewhere else. */
  | ({ type: "chrysalisHeart"; piece: number } & ChrysalisColEvent)
  /** The lit skin's last piece is off: the skin peels away and the cocoon shrinks. */
  | ({ type: "chrysalisShed"; skin: ChrysalisSkin } & ChrysalisColEvent)
  /** A skin's time ran out: it grows back. */
  | ({ type: "chrysalisRegrow"; skin: ChrysalisSkin } & ChrysalisColEvent)
  /** The last skin is off: the grub dies. */
  | ({ type: "chrysalisSpent" } & ChrysalisColEvent)
  /** The cocoon is gone; the wave may end. */
  | ({ type: "chrysalisOut" } & ChrysalisColEvent);
