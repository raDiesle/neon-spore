import { type InstarArrival, type InstarState, instarStep } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import { INSTAR_FLIGHT_ENDS, instarPhaseAt } from "./instar-shape.js";

/**
 * **How THE INSTAR arrives**, step by step: the flight the whole body takes
 * over the first part of a morph, read off the step's `arrive`
 * (`sim/instar-words.ts`) and nothing else.
 *
 * The owner, 25 September 2026: *it should enter more slowly, so it starts
 * small in the background, then it looks like it more and more flies towards
 * the users screen*; after the fire, *the boss flies away out of the screen,
 * then enters again 2-3 times before he stays*; and for the tail, *going out
 * of picture then going in from other side*. Three arrivals:
 *
 * - **approach**: far off and high, a speck, coming at the screen. Its size
 *   is a thing at a distance closing on the eye — `1 / z` with `z` falling
 *   straight — so it creeps for most of the flight and looms at the end.
 * - **passes**: up and off the top, then a pass across far away, a nearer
 *   pass back, and in from the right to stay. The turn side-on happens during
 *   the passes, while the body is small and moving.
 * - **cross**: off to the left, head first, and in from the right.
 * - **stay**: no flight. The body is where the last step left it and only
 *   the pose comes back — the second and third bite of the breath.
 *
 * **It is the picture's alone.** The flight is a transform round the body's
 * middle, and it is over by `INSTAR_FLIGHT_ENDS` of the morph — the moment
 * the marks start to glow up on their parts (`instar-marks.ts`) — so no mark
 * is ever drawn or pressed on a body that is not where the mark is. The
 * simulation does not know the body left: `hashWorld` cannot see this file.
 */

export interface Flight {
  /** Thousandths of the field's width and height the body is carried. */
  dxMilli: number;
  dyMilli: number;
  /** The body's size against its size at rest. */
  scale: number;
}

const AT_REST: Flight = { dxMilli: 0, dyMilli: 0, scale: 1 };

/** How far away the approach starts: the body is `1 / FAR` of its size. */
const FAR = 8;

/** Where the body is carried, and how large it is, this frame. */
export function instarFlight(s: InstarState, beat: number, beatPhase: number): Flight {
  const step = instarStep(s);
  if (s.phase !== "morph" || step === null) return AT_REST;
  const t = instarPhaseAt(s, beat, beatPhase) / (step.morphBeats * INSTAR_FLIGHT_ENDS);
  if (t >= 1) return AT_REST;
  return flown(step.arrive, Math.max(0, t));
}

/** The flight of one arrival, `t` from 0 to 1. */
export function flown(arrive: InstarArrival, t: number): Flight {
  if (arrive === "approach") {
    const scale = 1 / (1 + (FAR - 1) * (1 - t));
    // Far off is high up, near the horizon, and it weaves as it comes.
    const weave = 140 * Math.sin(t * Math.PI * 2.5) * (1 - t);
    return { dxMilli: weave, dyMilli: -320 * (1 - scale), scale };
  }
  if (arrive === "passes") return passes(t);
  // Stay: it never left. The morph is the jaws forced open where it is.
  if (arrive === "stay") return AT_REST;
  // Cross: off to the left, and in from the right.
  if (t < 0.45) {
    const e = smoothstep(t / 0.45);
    return { dxMilli: -1300 * e * e, dyMilli: -60 * e, scale: 1 };
  }
  const e = smoothstep((t - 0.45) / 0.55);
  return { dxMilli: 1300 * (1 - e), dyMilli: -60 * (1 - e), scale: 1 };
}

/** Up and away, a far pass, a near pass, and in to stay. */
function passes(t: number): Flight {
  if (t < 0.2) {
    const e = smoothstep(t / 0.2);
    return { dxMilli: 0, dyMilli: -1000 * e * e, scale: 1 + 0.6 * e };
  }
  if (t < 0.5) {
    // Far off, across the top, left to right.
    const e = (t - 0.2) / 0.3;
    return { dxMilli: -1100 + 2200 * e, dyMilli: -220, scale: 0.35 };
  }
  if (t < 0.75) {
    // Nearer, and back the other way, head first.
    const e = (t - 0.5) / 0.25;
    return { dxMilli: 1300 - 2600 * e, dyMilli: -60, scale: 0.7 };
  }
  const e = smoothstep((t - 0.75) / 0.25);
  return { dxMilli: 1200 * (1 - e), dyMilli: 0, scale: 0.8 + 0.2 * e };
}
