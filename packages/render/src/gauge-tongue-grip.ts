import { type GaugeState, gaugeTongueAsks, type SimConfig } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { gaugeTongueGrip } from "./gauge-tongue.js";
import type { Layout } from "./layout.js";
import { drawMarkHalo } from "./mark-feedback.js";
import { PALETTE } from "./palette.js";
import { drawTwoWayPull } from "./pull-two-way.js";
import type { Touch } from "./touch.js";

/**
 * **Both hands on the tongue**, in the rest after the second level
 * (`sim/gauge-tongue.ts`): his ring at the tip, hers along it, each on its
 * own seat's screen. The press is an ordinary carry, so every move reports
 * how far sideways the thumb has gone in thousandths of a tile, and that is
 * the twist the simulation reads. There is no secret in this rest, so the
 * mark is not split the way the tooth's is (`gauge-tooth-grip.ts`): each
 * seat is offered the one place its own hand goes.
 *
 * **The mark is the two-way pull** (`pull-two-way.ts`), the owner, 13 October
 * 2026, on THE GAUGE'S TONGUE: *standardised pull, in two possible
 * directions*. Each seat chooses its own way, so its knob starts in the
 * middle of a level channel `gaugeTongueTwistMilli` out each side with an
 * arrow of two heads, and rides the carry the sim keeps — the end of the
 * channel is as far as that half has to be wrung. Until then it was a bare
 * ring, which said nothing of the way.
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

/** This seat's pull, while the tongue is out: haloed until its hand is on it. */
export function drawGaugeTongueRing(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  dial: Dial,
  handleR: number,
  g: GaugeState,
  seat: 1 | 2,
  time: number,
): void {
  if (!gaugeTongueAsks(g)) return;
  const at = gaugeTongueGrip(dial, seat);
  const twist = cfg.gaugeTongueTwistMilli;
  const milli = seat === 1 ? g.tongueP1Milli : g.tongueP2Milli;
  if (!gaugeTongueHeld(g, seat)) drawMarkHalo(ctx, at.x, at.y, handleR, time);
  drawTwoWayPull(ctx, at, {
    knob: handleR,
    reach: (l.tile * twist) / 1000,
    along: milli / twist,
    mine: true,
    hex: PALETTE.red,
    rim: PALETTE.redRim,
    key: `gauge:tongue:${seat}`,
    time,
  });
}
