/**
 * **Everything THE LEAD does that neither screen already says**, as events.
 *
 * Its own file on `events-surge.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * The column, the direction, the lean and the segments are read off
 * `LeadState` every frame (`lead.ts`). What is *not* in the world a frame
 * later is the pace it just took, the wall it turned at, the shot that left
 * the top under it, the judgment — a segment gone or a miss that turned it —
 * and the moments of the last movement — the thumb on the stalk among them.
 * Every one names a column, because the ear pans on one: the body's own, or
 * the column a thing was dropped in.
 */

/** A column's worth of THE LEAD, for the ear to pan on. */
interface LeadColEvent {
  /** The column it happened over. */
  col: number;
}

export type LeadEvent =
  /** The body is in over `col`, facing `dir`, every segment on the stalk. */
  | ({ type: "leadEnter"; dir: -1 | 1 } & LeadColEvent)
  /** It paced to `col`: one beat's travel, the stalk leaning `lean`. */
  | ({ type: "leadPace"; dir: -1 | 1; lean: -1 | 0 | 1 } & LeadColEvent)
  /** It met a wall at `col` and turned to face `dir`. */
  | ({ type: "leadTurn"; dir: -1 | 1 } & LeadColEvent)
  /** A shot left the top of the field under `col`, due against the body on `dueBeat`. */
  | ({ type: "leadFlight"; dueBeat: number } & LeadColEvent)
  /** A shot arrived in the body's column: a segment gone, `segments` left. */
  | ({ type: "leadHit"; segments: number } & LeadColEvent)
  /** A shot arrived at `col` and the body was elsewhere. */
  | ({ type: "leadMiss" } & LeadColEvent)
  /** Every shot judged this beat missed: it doubled back, and faces `dir` now. */
  | ({ type: "leadReverse"; dir: -1 | 1 } & LeadColEvent)
  /** Running, it dropped a torch in `col` — the column it just left. */
  | ({ type: "leadTorch" } & LeadColEvent)
  /** Running, it dropped a rock in `col` — the column a shot has to be put in. */
  | ({ type: "leadRock" } & LeadColEvent)
  /** One segment left: it stopped dead at `col`, stalk upright, and nothing can touch it. */
  | ({ type: "leadStill" } & LeadColEvent)
  /** A thumb took the stalk at `col`: the still stops running out while it is on. */
  | ({ type: "leadGrip" } & LeadColEvent)
  /** The thumb came off the stalk at `col`: it passes on the next beat. */
  | ({ type: "leadRelease" } & LeadColEvent)
  /** The thumb held past `leadHoldBeats` and the stalk tore out of it at `col`: it passes anyway. */
  | ({ type: "leadTear" } & LeadColEvent)
  /** The still is over: the last pass began from `col` toward `dir`. */
  | ({ type: "leadPass"; dir: -1 | 1 } & LeadColEvent)
  /** The pass reached the wall at `col` with the beam nowhere in its way: it stands still again. */
  | ({ type: "leadWall" } & LeadColEvent)
  /** The beam stood in `col` as it came through: the last segment is gone. */
  | ({ type: "leadDown" } & LeadColEvent)
  /** The body is out, `leadOutBeats` after the beam; the wave may end. */
  | ({ type: "leadOut" } & LeadColEvent);
