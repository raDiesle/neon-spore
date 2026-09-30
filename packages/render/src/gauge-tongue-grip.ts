import { type GaugeState, gaugeTongueAsks } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { gaugeTongueGrip } from "./gauge-tongue.js";
import { drawGripRing } from "./grip-rings.js";
import type { Touch } from "./touch.js";

/**
 * **Both hands on the tongue**, in the rest after the second level
 * (`sim/gauge-tongue.ts`): his ring at the tip, hers along it, each on its
 * own seat's screen. The press is an ordinary carry, so every move reports
 * how far sideways the thumb has gone in thousandths of a tile, and that is
 * the twist the simulation reads. There is no secret in this rest, so the
 * ring is not split the way the tooth's is (`gauge-tooth-grip.ts`): each
 * seat is offered the one place its own hand goes.
 */

/** Whether this seat's hand is on the tongue now. */
export function gaugeTongueHeld(g: GaugeState, seat: 1 | 2): boolean {
  return (g.tongueHolds & seat) !== 0;
}

/** This seat's press on its own place on the tongue, or `null`. */
export function gaugeTongueUnder(
  dial: Dial,
  handleR: number,
  g: GaugeState,
  seat: 1 | 2,
  x: number,
  y: number,
): Touch | null {
  if (!gaugeTongueAsks(g)) return null;
  const at = gaugeTongueGrip(dial, seat);
  if (Math.hypot(x - at.x, y - at.y) > handleR) return null;
  const target = "gaugeTongue";
  return {
    player: seat,
    command: { kind: "drag", target, on: true, id: 0, fromMilli: 0, fromYMilli: 0 },
    hold: { kind: "drag", target, player: seat, originX: x, originY: y, id: 0 },
  };
}

/** This seat's ring, while the tongue is out: filled once its hand is on it. */
export function drawGaugeTongueRing(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  handleR: number,
  g: GaugeState,
  seat: 1 | 2,
  time: number,
): void {
  if (!gaugeTongueAsks(g)) return;
  const at = gaugeTongueGrip(dial, seat);
  drawGripRing(ctx, at.x, at.y, handleR, gaugeTongueHeld(g, seat), time);
}
