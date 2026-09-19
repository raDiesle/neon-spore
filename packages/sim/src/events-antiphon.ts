import type { Color } from "./types.js";

/**
 * **Everything THE ANTIPHON does that neither screen already says**, as
 * events.
 *
 * Its own file on `events-scuttle.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * The organs standing, the rail and the pits are read off `AntiphonState`
 * every frame (`antiphon.ts`). What is *not* in the world a frame later is
 * the moment an organ pushed out, the pit it shrivelled to, the hardening
 * a wrong candidate cost, an organ sinking back with its window run out,
 * a rejected candidate arriving as a body, the candidate she pulled off the
 * rail, the still, the ship and the eruption. Every one names a column,
 * because the ear pans on one: the organ's own, or the middle for the body as
 * a whole.
 */

/** A column's worth of THE ANTIPHON, for the ear to pan on. */
interface AntiphonColEvent {
  /** The column it happened over. */
  col: number;
}

export type AntiphonEvent =
  /** The body has risen over the middle column, smooth and featureless. */
  | ({ type: "antiphonEnter" } & AntiphonColEvent)
  /** An organ is pushing out over `col` — `shape` by index, `ANTIPHON_SHIP` for theirs — `organs` standing now. */
  | ({ type: "antiphonGrow"; shape: number; organs: number } & AntiphonColEvent)
  /** The organ's colour arrived in its column: `shape` shrivelled to a pit, `pits` on the body now. */
  | ({ type: "antiphonPit"; shape: number; pits: number } & AntiphonColEvent)
  /** A decoy's colour arrived in the decoy's column: the organs hardened, and the next rail is `rail` wide. */
  | ({ type: "antiphonHarden"; rail: number } & AntiphonColEvent)
  /** She pulled a candidate off her rail: `left` still stand on it, and nothing in `col` counts any more. */
  | ({ type: "antiphonPull"; left: number } & AntiphonColEvent)
  /** The organ over `col` stood its window out and sank back healed; `fired` says it sent a body down first. */
  | ({ type: "antiphonSink"; fired: boolean } & AntiphonColEvent)
  /** A candidate a pit rejected arrived as a body in its `color` down `col`. */
  | ({ type: "antiphonSpill"; color: Color } & AntiphonColEvent)
  /** The pits are all there: the surface has gone still before the last organ. */
  | ({ type: "antiphonStill" } & AntiphonColEvent)
  /** The last organ is their own ship, pushing out over `col`. */
  | ({ type: "antiphonShip" } & AntiphonColEvent)
  /** The right ship: every pit is erupting into the shape that made it, `pits` of them. */
  | ({ type: "antiphonBurst"; pits: number } & AntiphonColEvent)
  /** The body is gone, `antiphonOutBeats` after the burst; the wave may end. */
  | ({ type: "antiphonOut" } & AntiphonColEvent);
