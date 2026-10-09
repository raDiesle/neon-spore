import type { FlightAt } from "./instar-flight.js";
import { flyTaperedBody, flyTaperedFigure } from "./instar-flight-taper.js";
import type { Figure } from "./instar-shape.js";

/**
 * **What THE INSTAR looks like while it flies**, as a record so a second
 * answer can stand beside it on VERSUS (`instar:flight`, `docs/versus.md`).
 *
 * The owner, 7 October 2026: *it looks ugly when it flies in*. Taken on 9
 * October (TAPER, `instar-flight-taper.ts`): the approach stays face-on, the
 * wings spread full and the body behind the head one smooth taper, settling
 * into the morph's pose as it arrives. `figure` is handed that pose and
 * the flight under way (`instarFlightAt`) and gives back the pose to draw —
 * only while the body flies, which is over before any mark is up
 * (`instar-flight.ts`), so no mark or hit test reads what it returns.
 * `body` is how far the face-on body behind the head is drawn as one smooth
 * taper rather than its seamed plates (`instar-front-body.ts`).
 */
export type FlightFigure = (f: Figure, at: FlightAt) => Figure;

export interface FlightLook {
  figure: FlightFigure;
  body: (at: FlightAt) => number;
}

export const INSTAR_FLIGHT_LOOK: FlightLook = {
  figure: flyTaperedFigure,
  body: flyTaperedBody,
};
