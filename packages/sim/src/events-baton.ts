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

/** A socket's worth of THE BATON, for the twelve events that name one. */
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
  /** The second bead lit in the top socket, wearing the other colour. */
  | ({ type: "batonTwin" } & BatonSocketEvent)
  /** The two beads became one, in the last socket. Its next flight is the crossing. */
  | ({ type: "batonMerged" } & BatonSocketEvent)
  /** An act made on the crossing, in turn: `act` is its number, the launch being 0. */
  | { type: "batonAct"; col: number; act: number }
  /** A beat of the crossing went by without its act. The bead is back in the top socket and every socket is lit. */
  | ({ type: "batonMissed" } & BatonSocketEvent)
  /** A dead socket let go of its shell, which is now a rock at `col`, `row`. */
  | { type: "batonShed"; col: number; row: number }
  /** A dead socket's shell began coming away: `batonSwellBeats` to strip it. */
  | ({ type: "batonSwell" } & BatonSocketEvent)
  /** The locked-out seat's thumb took a swelling shell off clean. No rock. */
  | ({ type: "batonStripped" } & BatonSocketEvent)
  /** A thumb on the arm that was not this seat's to give: refused, and said. */
  | ({ type: "batonRefused" } & BatonSocketEvent)
  /** A thumb came down on one of the two beads under `merging`. */
  | ({ type: "batonHeld"; player: 1 | 2 } & BatonSocketEvent)
  /** The merge window closed with the pair short of it: the waiting bead is home. */
  | ({ type: "batonParted" } & BatonSocketEvent)
  /** The maw took the bead. The arm folds away. */
  | { type: "batonDown"; col: number };
