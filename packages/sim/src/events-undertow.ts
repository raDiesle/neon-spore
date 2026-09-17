/**
 * **Everything THE UNDERTOW does that neither screen already says**, as
 * events.
 *
 * Its own file on `events-baton.ts`' terms — one boss taken apart rather than
 * incidents that share a body — and one arm of `SimEvent`, so every consumer
 * still switches over the whole list.
 *
 * Where the floor is bowing, which breaches have a lobe standing in them and
 * how wide each has got are all read off `UndertowState` every frame
 * (`undertow.ts`). What is *not* in the world a frame later is the moment the
 * plate parted, the moment the maw closed over a lobe, the moment one
 * withdrew and left the hull shorter — so each of these is one such edge.
 */

/** A column's worth of THE UNDERTOW, for the events that name one. */
interface UndertowColEvent {
  /** The column of the hull it happened in. */
  col: number;
}

export type UndertowEvent =
  /** The floor began to bow in that column: a lobe is coming. */
  | ({ type: "undertowBow" } & UndertowColEvent)
  /** The plate parted and a lobe stands in the breach — `tall` if the maw cannot take it. */
  | ({ type: "undertowLobe"; tall: boolean } & UndertowColEvent)
  /** The maw closed over a lobe, or the beam burned one; the plate closes behind it. */
  | ({ type: "undertowTaken" } & UndertowColEvent)
  /** A lobe withdrew untaken. The breach is a scar in the pair's own hull — and a tall one took the plate with it (`Scar.plate`). */
  | ({ type: "undertowScar"; tall: boolean } & UndertowColEvent)
  /** A breach nobody plated got wide enough for a second lobe, now standing at `col`. */
  | ({ type: "undertowWidened" } & UndertowColEvent)
  /** The floor bowed under the cannon and it was not slid off in time: player 1's seat is unseated. */
  | ({ type: "undertowUnseated" } & UndertowColEvent)
  /** Every seam lit at once: the last lobe is rising in the middle column. */
  | ({ type: "undertowRise" } & UndertowColEvent)
  /** The maw was held open long enough: the body follows the lobe in, and the boss is beaten. */
  | ({ type: "undertowSwallowed" } & UndertowColEvent)
  /** The last lobe was not held. It came through, and so did the hull. */
  | ({ type: "undertowThrough" } & UndertowColEvent);
