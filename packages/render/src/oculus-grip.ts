import { type OculusState, oculusDone, type SimConfig, type World } from "@neon-spore/sim";
import type { Circle, Layout } from "./layout.js";
import { oculusArrived } from "./oculus-pose.js";
import { oculusCentre, oculusLift, oculusRadius } from "./oculus-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **The thumbs on THE OCULUS** — the first of its hands lanes, and the one
 * that makes the lens answer a hand at all (§11.44).
 *
 * Its own page for `mantle-grip.ts`' reason: the lens a finger is answered on
 * is the one `drawOculus` puts on the screen this frame, at the same centre
 * and the same drop into frame, and all this file adds is *whether* the press
 * counts.
 *
 * **Geometry says whose half is whose, on both phones.** The left half of the
 * lens is Player 1's leaf and the right half Player 2's (`sim/oculus-hand.ts`),
 * and both screens draw the whole lens, because a hold asks both seats at
 * once. A thumb on the other seat's half falls through to whatever is behind
 * it, as the simulation would refuse it anyway.
 *
 * **The lens takes a thumb whenever it stands**, lit step or not, from the
 * drop into frame until it shatters: the simulation records a leaf down
 * whenever the lens is present, so a pair already holding when a pair lights
 * are counted from its first beat — which is the thing to teach, *get your
 * thumbs on before it asks*.
 *
 * **The hold is a press, never a carry.** The thumb is down or up, and the
 * leaf pair slides across the face by how long both have been down
 * (`oculus-pose.ts`); where a thumb wanders to after the press means
 * nothing, and the lift is what lets go.
 */

/** Whether the lens is there to be held: every phase but the shatter. */
export function oculusTakesHold(s: OculusState): boolean {
  return !oculusDone(s);
}

/** A seat's side of the lens: the pilot's the left, the navigator's the right. */
export function oculusSide(seat: 1 | 2): -1 | 1 {
  return seat === 1 ? -1 : 1;
}

/** The lens's middle and radius where it stands this frame, lifted while it is still dropping in. */
function lensAt(
  l: Layout,
  cfg: SimConfig,
  s: OculusState,
  beat: number,
  beatPhase: number,
): Circle {
  const at = oculusCentre(l, cfg);
  const lift = oculusLift(l, oculusArrived(s, cfg, beat, beatPhase));
  return { x: at.x, y: at.y - lift, r: oculusRadius(l).rim };
}

/**
 * A seat's half of the lens as a circle: the round inside that half, which is
 * where the ghost thumb stands and what `handleCircle` answers. The press is
 * taken on the whole half-disc (`oculusLeafUnder`); this is its middle.
 */
export function oculusHalfCircle(
  l: Layout,
  cfg: SimConfig,
  s: OculusState,
  seat: 1 | 2,
  beat: number,
  beatPhase: number,
): Circle {
  const lens = lensAt(l, cfg, s, beat, beatPhase);
  return { x: lens.x + (oculusSide(seat) * lens.r) / 2, y: lens.y, r: lens.r / 2 };
}

/** The same for the world as it stands, for the placement and the ghost hand. */
export function oculusHalfStanding(
  l: Layout,
  world: World,
  s: OculusState,
  seat: 1 | 2,
  beatPhase: number,
): Circle {
  return oculusHalfCircle(l, world.cfg, s, seat, world.beat, beatPhase);
}

/**
 * A press on this seat's half of the lens. `bossOf(field, "oculus")` is `null`
 * on every wave without it. The middle line itself is either seat's, so a
 * thumb laid dead centre is never refused on a pixel.
 */
export function oculusLeafUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "oculus");
  if (s === null || !oculusTakesHold(s)) return null;
  const lens = lensAt(l, field.cfg, s, field.beat, field.beatPhase);
  const dx = x - lens.x;
  const dy = y - lens.y;
  if (dx * dx + dy * dy > lens.r * lens.r) return null;
  const seat = field.seat;
  if (dx * oculusSide(seat) < 0) return null;
  const target = seat === 1 ? "oculusLeafLeft" : "oculusLeafRight";
  return {
    player: seat,
    command: { kind: "drag", target, on: true, fromMilli: 0 },
    hold: { kind: "drag", target, player: seat, originX: x, originY: y },
  };
}
