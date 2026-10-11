import { mix } from "../src/goo-noise.js";
import { GOO } from "../src/goo-style.js";
import { PALETTE } from "../src/palette.js";

/**
 * **How a frame's log says a pull handle is on it**, since every knob and
 * channel is FIZZ (`goo-knob.ts`, `goo-track.ts`, 11 October 2026) and draws
 * in GOO's colours rather than the handle's own `hex` — which the tests that
 * counted a handle by its colour used to read.
 */

/** Once per knob drawn, held or not, this seat's or the partner's: SOFT PLASTIC's
 * satin body (`goo-soft-plastic.ts`), untinted while no limit is near. */
export const GOO_KNOB = `fillStyle=${mix(GOO.body, GOO.core, 0.35)}`;

/** At least once per open channel drawn: the place at its end, in the slime's own colour. */
export const GOO_TRACK = `fillStyle=${GOO.body}`;

/** Twice per knob's arrow — a fill and a stroke in the field's own colour, its dark
 * edge (`goo-soft-arrow.ts`) — which a test counting punched discs by that colour
 * takes away: `PALETTE.background` counted, less this twice, plus the knobs. */
export const GOO_ARROW = `strokeStyle=${PALETTE.background}`;
