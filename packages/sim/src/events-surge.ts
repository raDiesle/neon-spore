/**
 * **Everything THE SURGE does that neither screen already says**, as events.
 *
 * Its own file on `events-sinew.ts`' terms — one boss taken apart rather
 * than incidents that share a body — and one arm of `SimEvent`, so every
 * consumer still switches over the whole list.
 *
 * The pressure, the notches and the two hands are read off `SurgeState`
 * every frame (`surge.ts`). What is *not* in the world a frame later is the
 * moment a thumb went on or came off, the pressure crossing into a notch's
 * band, the vent, the burst, the rock spat, the charge lost — so each of
 * these is one such edge. Every one names a column, because the ear pans on one: the bulb's
 * own, or the side of it a seat's thumb is drawn on.
 */

/** A column's worth of THE SURGE, for the ear to pan on. */
interface SurgeColEvent {
  /** The column it happened over. */
  col: number;
}

export type SurgeEvent =
  /** The bulb is in over `col`, on `row`, its seam shut. */
  | ({ type: "surgeSettle"; row: number } & SurgeColEvent)
  /** A thumb went on the bulb. */
  | ({ type: "surgeGrip"; player: 1 | 2 } & SurgeColEvent)
  /** A thumb came off — lifted, or thrown off by a burst. */
  | ({ type: "surgeRelease"; player: 1 | 2 } & SurgeColEvent)
  /** The pressure came into the notch's band: the window is open. */
  | ({ type: "surgeNear" } & SurgeColEvent)
  /** Both thumbs came off inside the band: a vent, and `notches` are open now with the bulb on `row`. */
  | ({ type: "surgeVent"; notches: number; row: number } & SurgeColEvent)
  /** The pressure went over: a burst that threw `gums` gums, and the hands are off. */
  | ({ type: "surgeBurst"; gums: number } & SurgeColEvent)
  /** One gum thrown out of the bulb, down `col` from `row`. */
  | ({ type: "surgeGum"; row: number } & SurgeColEvent)
  /** A rock spat at the ship while both thumbs were on it, down `col` from `row`. */
  | ({ type: "surgeRock"; row: number } & SurgeColEvent)
  /** The last thumb came off short of the band, or late: the charge did not count. */
  | ({ type: "surgeLost" } & SurgeColEvent)
  /** A body reached the bulb and was taken into it, from `row`. */
  | ({ type: "surgeAbsorb"; row: number } & SurgeColEvent)
  /** A burst closed a notch again: `notches` are open now. */
  | ({ type: "surgeClose"; notches: number } & SurgeColEvent)
  /** The last notch opened: the bulb is turning inside out on `row`. */
  | ({ type: "surgeEvert"; row: number } & SurgeColEvent)
  /** The eversion is done: the fight is over. */
  | ({ type: "surgeOut" } & SurgeColEvent);
