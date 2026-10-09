import { smoothstep } from "./ease.js";
import type { FlightAt } from "./instar-flight.js";
import type { Figure } from "./instar-shape.js";

/**
 * **THE INSTAR's approach**, taken from VERSUS on 9 October 2026 (TAPER,
 * the owner's (C) of 8 October): kept face-on, with a dragon behind the head rather than a seamed tube: the
 * body is one smooth taper going away a third of the way round, the legs
 * hanging off it, and the wings spread full. As it arrives, the plates come
 * back and the wings settle into the pose the morph is making. Only the
 * approach: the laps fly round side-on, and a stay never leaves.
 */

/** How much of the approach is left when the body begins to settle into the morph's pose. */
const SETTLE_FROM = 0.7;

/** How much of the flying body is shown, `t` of the way through an approach: 1 far off, 0 arrived. */
function flyingShare(at: FlightAt): number {
  if (at.arrive !== "approach") return 0;
  const away = at.leaves ? smoothstep(at.t / 0.2) : 1;
  return away * (1 - smoothstep((at.t - SETTLE_FROM) / (1 - SETTLE_FROM)));
}

/** The wings spread full while it flies in, settling to the morph's own as it arrives. */
export function flyTaperedFigure(f: Figure, at: FlightAt): Figure {
  const share = flyingShare(at);
  if (share <= 0) return f;
  return { ...f, wing: f.wing + (1 - f.wing) * share };
}

/** The body behind the head one smooth taper while it flies in. */
export function flyTaperedBody(at: FlightAt): number {
  return flyingShare(at);
}
