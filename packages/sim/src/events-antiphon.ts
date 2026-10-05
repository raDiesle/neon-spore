/**
 * **Everything THE ANTIPHON does that neither screen already says**, as
 * events.
 *
 * Its own file on `events-scuttle.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * The organ standing, the rail, the carry and the pits are read off
 * `AntiphonState` every frame (`antiphon.ts`). What is *not* in the world a
 * frame later is the moment an organ pushed out, the pit a right carry
 * shrivelled it to, the wrong one that hardened it, the window running out,
 * the still, the ship and the eruption. Every one names a column, because
 * the ear pans on one: the organ's own, which is the middle, or the wrong
 * candidate's.
 */

/** A column's worth of THE ANTIPHON, for the ear to pan on. */
interface AntiphonColEvent {
  /** The column it happened over. */
  col: number;
}

export type AntiphonEvent =
  /** The body has risen over the middle column, smooth and featureless. */
  | ({ type: "antiphonEnter" } & AntiphonColEvent)
  /** An organ is pushing out — `shape` by index. */
  | ({ type: "antiphonGrow"; shape: number } & AntiphonColEvent)
  /** The organ was carried to its place: `shape` shrivelled to a pit, `pits` on the body now. */
  | ({ type: "antiphonPit"; shape: number; pits: number } & AntiphonColEvent)
  /** A decoy — `shape`, from the rail over `col` — was carried to the organ's place: the organ hardened and the hull is struck. */
  | ({ type: "antiphonHarden"; shape: number } & AntiphonColEvent)
  /** The organ stood its window out with nothing carried home: it sank, and the hull is struck. */
  | ({ type: "antiphonSink" } & AntiphonColEvent)
  /** The pits are all there: the surface has gone still before the last organ. */
  | ({ type: "antiphonStill" } & AntiphonColEvent)
  /** The last organ is their own ship, pushing out. */
  | ({ type: "antiphonShip" } & AntiphonColEvent)
  /** The right ship: every pit is erupting into the shape that made it, `pits` of them. */
  | ({ type: "antiphonBurst"; pits: number } & AntiphonColEvent)
  /** The body is gone, `antiphonOutBeats` after the burst; the wave may end. */
  | ({ type: "antiphonOut" } & AntiphonColEvent);
