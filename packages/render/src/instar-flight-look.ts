import type { FlightAt } from "./instar-flight.js";
import type { Figure } from "./instar-shape.js";

/**
 * **What THE INSTAR looks like while it flies**, as a record so a second
 * answer can stand beside it on VERSUS (`instar:flight`, `docs/versus.md`).
 *
 * The owner, 7 October 2026: *it looks ugly when it flies in*. The shipped
 * answer is the pose the morph is in, untouched: face-on, the approach is a
 * mask with the body trailing behind it. `figure` is handed that pose and
 * the flight under way (`instarFlightAt`) and gives back the pose to draw —
 * only while the body flies, which is over before any mark is up
 * (`instar-flight.ts`), so no mark or hit test reads what it returns.
 */
export type FlightFigure = (f: Figure, at: FlightAt) => Figure;

export interface FlightLook {
  figure: FlightFigure;
}

export const INSTAR_FLIGHT_LOOK: FlightLook = {
  figure: (f) => f,
};
