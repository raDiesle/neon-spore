import { smoothstep } from "../../../../../packages/render/src/ease.js";
import { instarBetween } from "../../../../../packages/render/src/instar-between.js";
import type { FlightAt } from "../../../../../packages/render/src/instar-flight.js";
import type { Figure } from "../../../../../packages/render/src/instar-shape.js";

/**
 * The approach flown side-on (the queue's option A, the owner's (C) of 8
 * October 2026): the dragon comes in from far away in profile — the turned
 * head to the left, the four legs under it, the wings raised — and only as it
 * arrives does it turn face-on into the pose the morph is making. Only the
 * approach: the laps already fly round side-on, and a stay never leaves.
 */

/** In profile and flying level: the brood's line without the brood, the wings full up, the jaws a little open. */
const FLY: Partial<Figure> = {
  headX: 240,
  headY: 330,
  headR: 150,
  jawUp: 0.25,
  jawDown: 0.35,
  side: 1,
  wing: 1,
  rearX: 880,
  rearY: 360,
  eggs: 0,
  eggsX: 660,
  eggsY: 345,
  nest: 0,
  nestX: 360,
  nestY: 340,
  tail: 0,
  reach: 0,
  flame: 0,
};

/** How much of the approach is left when the turn face-on begins. */
const TURN_FROM = 0.65;
/** How much of a leaving body's flight it takes to turn side-on as it goes. */
const TURN_AWAY = 0.2;

/** How side-on the body flies `t` of the way through an approach: 1 in profile, 0 the morph's own pose. */
function profileShare(at: FlightAt): number {
  const away = at.leaves ? smoothstep(at.t / TURN_AWAY) : 1;
  const home = 1 - smoothstep((at.t - TURN_FROM) / (1 - TURN_FROM));
  return away * home;
}

export function flySideOn(f: Figure, at: FlightAt): Figure {
  if (at.arrive !== "approach") return f;
  const share = profileShare(at);
  if (share <= 0) return f;
  return instarBetween(f, { ...f, ...FLY }, share);
}
