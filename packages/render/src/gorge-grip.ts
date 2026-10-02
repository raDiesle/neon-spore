import { type GorgeState, gorgeOffers, gorgeTapSeat, type SimConfig } from "@neon-spore/sim";
import { gorgePose, gorgePosed } from "./gorge-drift.js";
import { gorgeBubbleAt } from "./gorge-place.js";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";
import { showsGorgeTap } from "./view-role-clocks-b.js";

/**
 * **THE GORGE's one thumb**: the pilot's tap that opens the bubble at the
 * bottom of a ring, drawn and answered in one file because the circle a
 * thumb is answered at is the circle the ring is drawn from.
 *
 * A ring stands on the bottom bubble while it is shut, on the pilot's screen
 * alone (`showsGorgeTap`). Which seat taps and which bubble is on offer is
 * the simulation's (`gorgeTapSeat`, `gorgeOffers`, `sim/gorge-hand.ts`), and
 * the ring is `queen-grip.ts`' — breathing until it opens. It carries the
 * dial as well: the taps still wanted, running out to open, the one readout
 * of how far the pilot has got on the screen that is doing it.
 */

/**
 * The ring on bubble `i`: centred where the bubble swells, above its intake,
 * and carried with the lobe as it leans at `beat` and `beatPhase`
 * (`gorge-drift.ts`) — the thumb lands on the lobe the canvas drew.
 */
export function gorgeGripCircle(
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  i: number,
  beat: number,
  beatPhase: number,
): Circle {
  const root = gorgeBubbleAt(l, cfg, g, i, beat + beatPhase);
  const at = gorgePosed(gorgePose(l, cfg, root, i, beat, beatPhase), {
    x: root.x,
    y: root.y - l.tile * 0.5,
  });
  return { x: at.x, y: at.y, r: handleRadius(l, cfg) };
}

/**
 * The press, answered for whichever seat's ring it landed in, nearest first
 * when two overlap (`mirrorLobeUnder`'s rule). `bossOf(field, "gorge")` is `null` on
 * every wave without the sack, and a press then falls through to whatever
 * is behind it. Each press is one tap: the simulation reads only that it
 * came down, on which bubble, and on which tick.
 */
export function gorgeGripUnder(l: Layout, x: number, y: number, field: Field): Touch | null {
  const g = bossOf(field, "gorge");
  if (g === null) return null;
  let best: { id: number; d: number } | null = null;
  for (const id of gorgeOffers(g, field.cfg, field.seat)) {
    const c = gorgeGripCircle(l, field.cfg, g, id, field.beat, field.beatPhase);
    if (!hitCircle(c, x, y)) continue;
    const d = (x - c.x) ** 2 + (y - c.y) ** 2;
    if (best === null || d < best.d) best = { id, d };
  }
  if (best === null) return null;
  const id = best.id;
  const player = field.seat;
  const target = "gorgeLobe";
  return {
    player,
    command: { kind: "drag", target, on: true, fromMilli: 0, fromYMilli: 0, id },
    hold: { kind: "drag", target, player, originX: x, originY: y, id },
  };
}

/**
 * The ring, for the screen that is the tapping seat's. Called after the sack
 * is drawn, so a ring stands on its lobe and nothing stands on the ring; the
 * halo under it and the verdict over it are `gorge-marks.ts`'.
 */
export function drawGorgeGrip(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  g: GorgeState,
  role: ViewRole,
  beat: number,
  beatPhase: number,
  time: number,
): void {
  if (!showsGorgeTap(role)) return;
  for (const i of gorgeOffers(g, cfg, gorgeTapSeat)) {
    const c = gorgeGripCircle(l, cfg, g, i, beat, beatPhase);
    drawGripRing(ctx, c.x, c.y, c.r, false, time);
    const taps = g.intakes[i]?.taps ?? 0;
    drawGripDial(ctx, c.x, c.y, c.r, 1 - taps / Math.max(1, cfg.gorgeOpenTaps));
  }
}
