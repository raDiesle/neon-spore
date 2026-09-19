/**
 * **Everything THE SCUTTLE does that neither screen already says**, as events.
 *
 * Its own file on `events-lead.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * The parts in their sockets, which hang loose, which is live and the
 * cadence are read off `ScuttleState` every frame (`scuttle.ts`). What is
 * *not* in the world a frame later is the moment a part came loose, the
 * throw, the shot that struck one off or was the wrong colour for it, the
 * pod that bought a beat, and the moments of the last part, and the one
 * carry a hand makes on this frame. Every one names a column, because the
 * ear pans on one: the part's own — which for a part the pilot swung is the
 * column he put it in rather than its socket's (`scuttlePartCol`).
 */

/** A column's worth of THE SCUTTLE, for the ear to pan on. */
interface ScuttleColEvent {
  /** The column it happened over. */
  col: number;
}

export type ScuttleEvent =
  /** The frame is in, `parts` in its sockets, over the middle column. */
  | ({ type: "scuttleEnter"; parts: number } & ScuttleColEvent)
  /** The part in `socket` came loose over `col`, thrown on `throwBeat`; `live` says whether a shot can take it. */
  | ({ type: "scuttleLoose"; socket: number; live: boolean; throwBeat: number } & ScuttleColEvent)
  /** The part in `socket` was thrown down `col`, `left` still in the frame. */
  | ({ type: "scuttleThrow"; socket: number; left: number } & ScuttleColEvent)
  /** A shot in the live part's column and colour struck it off `socket` while it hung, `left` still in the frame. */
  | ({ type: "scuttleStruck"; socket: number; left: number } & ScuttleColEvent)
  /** The pilot carried the part in `socket` from `from` to `col`: it is thrown down the column he put it in. */
  | ({ type: "scuttleSwing"; socket: number; from: number } & ScuttleColEvent)
  /** A shot arrived in the live part's column in the colour it is not: nothing. */
  | ({ type: "scuttleRebuff" } & ScuttleColEvent)
  /** A thrown pod was taken: every cadence from here is `slack` longer. */
  | ({ type: "scuttleSlack"; slack: number } & ScuttleColEvent)
  /** One part left, in `socket`: the frame is drawing back for the throw, due on `throwBeat`. */
  | ({ type: "scuttleWind"; socket: number; throwBeat: number } & ScuttleColEvent)
  /** The last part was thrown down `col`: the hull is breached and the wave is lost. */
  | ({ type: "scuttleLast" } & ScuttleColEvent)
  /** The beam stood in the last part's column: it went in its socket and the frame is collapsing. */
  | ({ type: "scuttleDown" } & ScuttleColEvent)
  /** The frame is gone, `scuttleOutBeats` after the beam; the wave may end. */
  | ({ type: "scuttleOut" } & ScuttleColEvent);
