import * as look from "../../../../../packages/render/src/valve-draw.js";
import { patch, type Variant } from "../../../variant.js";

/**
 * SWAY — offered 27 September 2026, from the queue's "THE VALVE's pins have
 * no secondary motion of their own". The drum's outline breathes on
 * `time * 0.4` and the story moves only inside a step; the three pins hang
 * under it and never swing. So each still-hung pin sways about the top of
 * its plate the way a hung plate would, on a slow period, each out of step
 * with the next. A pin sliding free stops swaying as it goes.
 *
 * The queue asked for a degree; a degree at a plate's length is a pixel, so
 * this is three (about 0.05 rad), the least the pins read at.
 */
/** How far a pin swings each way, in radians — about three degrees. */
const SWAY = 0.05;
/** The rate in radians a second, off the drum's 0.4. */
const SWAY_RATE = 0.67;
/** How far each pin's swing is out of step with the one before. */
const APART = 2.1;

const sway = (i: number, going: number, time: number): number =>
  SWAY * (1 - Math.min(1, going)) * Math.sin(time * SWAY_RATE + i * APART);

export const VALVE_PIN_SWAY: Variant = {
  slot: "valve:pin",
  name: "sway",
  sentence:
    "sway — each of THE VALVE's three hung pins swings a few degrees about its top on a slow period, out of step with the others, and stops as it slides free",
  dir: "tools/versus/candidates/valve-pin/sway",
  patches: [
    patch({
      target: look.VALVE_PIN,
      reached: () => look.VALVE_PIN,
      where: {
        file: "packages/render/src/valve-draw.ts",
        symbol: "VALVE_PIN",
        type: "{ sway: (i: number, going: number, time: number) => number }",
      },
      fields: { sway },
    }),
  ],
};
