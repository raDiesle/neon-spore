/**
 * **Everything THE SINEW does that neither screen already says**, as events.
 *
 * Its own file on `events-gorge.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * The pulls, the sum, the zone and the fibres are all read off `SinewState`
 * every frame (`sinew.ts`). What is *not* in the world a frame later is the
 * moment a hand took hold, the moment the sum crossed into the zone, the
 * fibre parting, the snap — so each of these is one such edge. Every one
 * names a column, because the ear pans on one: the mass's own for the
 * tendon's, and the handle's side for a hand's.
 */

/** A column's worth of THE SINEW, for the ear to pan on. */
interface SinewColEvent {
  /** The column it happened over. */
  col: number;
}

export type SinewEvent =
  /** The tendon is in over `col`, with `fibres` whole and the mass on `row`. */
  | ({ type: "sinewSettle"; fibres: number; row: number } & SinewColEvent)
  /** A hand took hold of its handle. */
  | ({ type: "sinewGrip"; player: 1 | 2 } & SinewColEvent)
  /** A hand let go — lifted, or thrown off by a snap. */
  | ({ type: "sinewRelease"; player: 1 | 2 } & SinewColEvent)
  /** The sum came into the zone: the hold is counting. */
  | ({ type: "sinewEnter" } & SinewColEvent)
  /** The sum left the zone before the hold was done: the count starts over. */
  | ({ type: "sinewLoose" } & SinewColEvent)
  /** A fibre parted; `fibres` are left and the mass hangs on `row` now. */
  | ({ type: "sinewPart"; fibres: number; row: number } & SinewColEvent)
  /** The sum went over the zone's top: the tendon snapped back and threw `rocks` rocks. */
  | ({ type: "sinewSnap"; rocks: number } & SinewColEvent)
  /** One rock shaken out of the mass, from `row` down `col`. */
  | ({ type: "sinewRock"; row: number } & SinewColEvent)
  /** Both hands carried outward caught the swinging tendon: the snap-back is over early. */
  | ({ type: "sinewCatch" } & SinewColEvent)
  /** The tendon went slack another step under a hand; `slackMilli` is the whole of it. */
  | ({ type: "sinewSlack"; slackMilli: number } & SinewColEvent)
  /** The last fibre parted: the mass is falling from `row`. */
  | ({ type: "sinewFall"; row: number } & SinewColEvent)
  /** Both hands pulled one way and the falling mass walked a column: `col` is where it is now. */
  | ({ type: "sinewSwing"; dir: -1 | 1 } & SinewColEvent)
  /** The mass landed at the wall, clear of the ship: the fight is over. */
  | ({ type: "sinewOut" } & SinewColEvent)
  /** The mass landed on the hull. */
  | ({ type: "sinewCrush" } & SinewColEvent);
