import type { UndertowAnswer } from "./undertow.js";

/**
 * **Everything THE UNDERTOW does that neither screen already says**, as
 * events.
 *
 * Its own file on `events-baton.ts`' terms — one boss taken apart rather than
 * incidents that share a body — and one arm of `SimEvent`, so every consumer
 * still switches over the whole list.
 *
 * Where a lobe stands, what colour it is and how tall it has grown are all
 * read off `UndertowState` every frame (`undertow.ts`). What is *not* in the
 * world a frame later is the moment the plate parted, the moment a lobe was
 * taken, the moment a thumb shrank one and the moment one burst — so each of
 * these is one such edge.
 */

/** A column's worth of THE UNDERTOW, for the events that name one. */
interface UndertowColEvent {
  /** The column of the hull it happened in. */
  col: number;
}

export type UndertowEvent =
  /** The floor began to bow in that column: a lobe is coming. */
  | ({ type: "undertowBow" } & UndertowColEvent)
  /** The plate parted and a lobe stands in the column, in the colour of the control that takes it. */
  | ({ type: "undertowLobe"; answer: UndertowAnswer } & UndertowColEvent)
  /** The maw or the shield took a standing lobe; the plate closes behind it. */
  | ({ type: "undertowTaken" } & UndertowColEvent)
  /** A lobe stood too long and grew: only a tap brings it back now. */
  | ({ type: "undertowGrow" } & UndertowColEvent)
  /** A thumb on a tall lobe shrank it back to standing (`undertow-press.ts`). */
  | ({ type: "undertowTapped" } & UndertowColEvent)
  /** A tall lobe nobody tapped burst through the hull, and the wave is lost. */
  | ({ type: "undertowBurst" } & UndertowColEvent)
  /** The level's clock ran out: every lobe still up shrinks back into the floor. */
  | ({ type: "undertowEbb" } & UndertowColEvent);
