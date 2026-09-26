import type { SimConfig, SlingState } from "@neon-spore/sim";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import { slingArrived } from "./sling-pose.js";
import { slingHandle, slingTip } from "./sling-shape.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";

/**
 * **THE SLING's two cords as controls**: `slingDrawLeft` is the pilot's
 * (seat 1), `slingDrawRight` the navigator's (seat 2) — geometry says whose
 * arm is whose, the same as `sling-hand.ts`'s command side does, and the
 * wrong seat's thumb finds nothing there to press.
 *
 * **A draw is `DrawRelease`, §32's primitive**: `on: true` is the thumb
 * landing on its own handle; the lift is the gesture, carrying the swipe's
 * side on `fromMilli` the way THE WARDEN's hatch does (`warden-grip.ts`), so
 * `touch.ts`'s `swiped` set has to know this target too or the sign never
 * reaches the sim.
 *
 * **The circle is the handle at rest**, where the cord hangs slack — not
 * wherever a live draw has pulled it — THE WARDEN's own rule: a thumb is
 * asked to land where the control stands, not chase where it goes once held.
 */

const GRIP_R_MUL = 0.85;

function seatSide(field: Field): 0 | 1 | null {
  return field.seat === 1 ? 0 : field.seat === 2 ? 1 : null;
}

function target(side: 0 | 1): "slingDrawLeft" | "slingDrawRight" {
  return side === 0 ? "slingDrawLeft" : "slingDrawRight";
}

/** The rest handle for tine `side`, once the fork has arrived. */
export function slingDrawCircle(
  l: Layout,
  cfg: SimConfig,
  s: SlingState,
  side: 0 | 1,
  beat: number,
  beatPhase: number,
): Circle {
  const arrived = slingArrived(s, cfg, beat, beatPhase);
  const tip = slingTip(l, side, arrived);
  const handle = slingHandle(l, side, 0);
  return {
    x: tip.x + arrived * (handle.x - tip.x),
    y: tip.y + arrived * (handle.y - tip.y),
    r: l.tile * GRIP_R_MUL,
  };
}

export function slingDrawUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const s = bossOf(field, "sling");
  if (s === null) return null;
  const side = seatSide(field);
  if (side === null) return null;
  const circle = slingDrawCircle(l, field.cfg, s, side, field.beat, field.beatPhase);
  if (!hitCircle(circle, x, y)) return null;
  const t = target(side);
  return {
    player: field.seat,
    command: { kind: "drag", target: t, on: true, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target: t, player: field.seat, originX: x, originY: y },
  };
}
