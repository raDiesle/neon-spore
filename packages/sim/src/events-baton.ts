/**
 * **Everything THE BATON does that neither screen already says**, as events.
 *
 * Its own file on `events-stare.ts`' terms — one boss taken apart rather than
 * incidents that share a body — and one arm of `SimEvent`, so every consumer
 * still switches over the whole list.
 *
 * Where the bead is, which sockets are dark and which seat is locked are all
 * read off `BatonState` every frame (`baton.ts`). What is *not* in the world a
 * frame later is the moment something changed hands — so each of these is one
 * handover's edge, and together they are the metronome the pair is being
 * asked to become.
 */

/** A socket's worth of THE BATON, for the four events that name one. */
interface BatonSocketEvent {
  /** The column the bead is over. */
  col: number;
  /** The socket, base first: the one it left, landed in or was shaken back to. */
  socket: number;
}

export type BatonEvent =
  /** Player 1's trigger sent the bead out of its socket. */
  | ({ type: "batonLaunch" } & BatonSocketEvent)
  /** Player 2's shot of the right colour went through the bead in flight. */
  | ({ type: "batonStruck" } & BatonSocketEvent)
  /** A struck bead came down in the next socket; the one it left is dark. */
  | ({ type: "batonLanded" } & BatonSocketEvent)
  /** An unstruck bead came down where it left, and the socket relit. */
  | ({ type: "batonRelit" } & BatonSocketEvent)
  /** A bead that sat too long was shaken back to the top socket. */
  | ({ type: "batonSettled" } & BatonSocketEvent)
  /** A dead socket let go of its shell, which is now a rock at `col`, `row`. */
  | { type: "batonShed"; col: number; row: number }
  /** The maw took the bead. The arm folds away. */
  | { type: "batonDown"; col: number };
