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
 *   When a body is already on the field it first goes: off and up into the
 *   distance by the same law run backwards, swerving wide, to the speck the
 *   approach starts from — never gone from full size to a speck in a frame.
 * - **passes** and **cross**: round, not across — the owner, 27 September
 *   2026: *not just left to right out of the screen, but around, e.g. in the
 *   path of a circle, and more important to the back and again to the front*.
 *   The body flies an ellipse in width and depth (`orbit`): back into the
 *   distance first, small, high and dim, round to the front larger than at
 *   rest, and back — two laps for the passes, one and a half for the cross —
 *   and it settles into the pose out of the last of it. The turn side-on
 *   happens on the way, while the body is small and moving.
 * - **stay**: no flight. The body is where the last step left it and only
 *   the pose comes back — the second and third bite of the breath.
 *
 * **It is the picture's alone.** The flight is a transform round the body's
 * middle, and it is over by `INSTAR_FLIGHT_ENDS` of the morph, well before
 * the window opens and the marks come up (`instar-marks.ts`) — so no mark
 * is ever drawn or pressed on a body that is not where the mark is. The
 * simulation does not know the body left: `hashWorld` cannot see this file.
 */

export interface Flight {
  /** Thousandths of the field's width and height the body is carried. */
  dxMilli: number;
  dyMilli: number;
  /** The body's size against its size at rest. */
  scale: number;
  /** Which way the body faces, -1..1: 1 the way it stands at rest, -1 its
   * mirror — the far side of a lap, flying the other way — and nought seen
   * end-on, flying straight into the distance or out of it. */
  turn: number;
  /** How bright the body is against at rest, 0..1: a body far behind the
   * field is dimmer. */
  light: number;
}

const AT_REST: Flight = { dxMilli: 0, dyMilli: 0, scale: 1, turn: 1, light: 1 };

/** How far away the approach starts: the body is `1 / FAR` of its size. */
const FAR = 8;

/** Where the body is carried, and how large it is, this frame. */
export function instarFlight(s: InstarState, beat: number, beatPhase: number): Flight {
  const step = instarStep(s);
  if (s.phase !== "morph" || step === null) return AT_REST;
  const t = instarPhaseAt(s, beat, beatPhase) / (step.morphBeats * INSTAR_FLIGHT_ENDS);
  if (t >= 1) return AT_REST;
  return flown(step.arrive, Math.max(0, t), s.cursor > 0);
}

/** How much of an approach is spent leaving, when there was a body on the field to leave. */
const LEAVE = 0.3;

/** The flight of one arrival, `t` from 0 to 1; `leaves` when a body stood on the field before it. */
export function flown(arrive: InstarArrival, t: number, leaves = false): Flight {
  if (arrive === "approach" && leaves) {
    if (t >= LEAVE) return flown(arrive, (t - LEAVE) / (1 - LEAVE));
    const e = smoothstep(t / LEAVE);
    const scale = 1 / (1 + (FAR - 1) * e);
    return {
      ...AT_REST,
      dxMilli: -380 * Math.sin(Math.PI * e),
      dyMilli: -320 * (1 - scale),
      scale,
    };
  }
  if (arrive === "approach") {
    const scale = 1 / (1 + (FAR - 1) * (1 - t));
    // Far off is high up, near the horizon, and it weaves as it comes.
    const weave = 140 * Math.sin(t * Math.PI * 2.5) * (1 - t);
    return { ...AT_REST, dxMilli: weave, dyMilli: -320 * (1 - scale), scale };
  }
  // Stay: it never left. The morph is the jaws forced open where it is.
  if (arrive === "stay") return AT_REST;
  return orbit(t, arrive === "passes" ? 2 : 1.5);
}

/** How far the lap's centre is behind the body at rest, and how far round
 * it the body flies — in the approach's depth, where the body is `1 / (1 + z)`
 * of its size: from a third of it behind to a fifth larger in front. */
const ORBIT_BEHIND = 0.75;
const ORBIT_DEEP = 0.92;
/** How far across the lap goes, thousandths of the field, before it is seen at its depth. */
const ORBIT_WIDE = 700;
/** How much of the flight the body takes to leave for the lap, and to settle out of it. */
const ORBIT_OUT = 0.15;
const ORBIT_SETTLE = 0.3;

/** How much a step into the distance counts against one across, in the
 * facing: thousandths of the field one unit of depth is worth. */
const ORBIT_DEPTH_SEEN = 1000;
/** The narrowest the body is drawn end-on: turned through nought it is a
 * sliver, a card seen edgewise, so it snaps to its mirror from here. */
const ORBIT_EDGE = 0.45;

/**
 * `laps` round an ellipse in width and depth, starting at its far end so the
 * body goes to the back first. The lap is drawn at its depth by the
 * approach's law, and it grows out of the body at rest and shrinks back into
 * it (`reach`), so the flight starts and ends where the body stands.
 *
 * **The head faces the way it flies.** The near half of a lap goes right to
 * left, the way the head faces at rest; on the far half the body is its own
 * mirror, and it turns through end-on where the lap runs into the distance
 * or out of it — read off the lap as drawn, since its depth moves where on
 * the screen it turns — snapping to its mirror rather than going to a sliver.
 */
function orbit(t: number, laps: number): Flight {
  const reach = smoothstep(t / ORBIT_OUT) * (1 - smoothstep((t - 1 + ORBIT_SETTLE) / ORBIT_SETTLE));
  if (reach <= 0) return AT_REST;
  const a = Math.PI * 2 * laps * t;
  const here = lap(a, reach);
  const on = lap(a + 1e-3, 1);
  const was = lap(a - 1e-3, 1);
  const across = on.dxMilli - was.dxMilli;
  const deep = (on.z - was.z) * ORBIT_DEPTH_SEEN;
  const facing = -across / (Math.hypot(across, deep) || 1);
  const scale = 1 / (1 + here.z);
  return {
    dxMilli: here.dxMilli,
    dyMilli: 320 * (scale - 1),
    scale,
    turn: edgewise(1 + (facing - 1) * reach),
    light: Math.min(1, 0.35 + 0.65 * scale),
  };
}

/** Where the lap is at angle `a`, grown `reach` out of the body at rest: its depth, and across as seen. */
function lap(a: number, reach: number): { dxMilli: number; z: number } {
  const z = reach * (ORBIT_BEHIND + ORBIT_DEEP * Math.cos(a));
  return { dxMilli: (reach * ORBIT_WIDE * Math.sin(a)) / (1 + z), z };
}

/** A facing no narrower than `ORBIT_EDGE`, on the side it is already on. */
function edgewise(turn: number): number {
  return (turn < 0 ? -1 : 1) * Math.max(ORBIT_EDGE, Math.abs(turn));
}
