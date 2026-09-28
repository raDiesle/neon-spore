import {
  type GorgeState,
  gorgeOffers,
  gorgePinchSeat,
  gorgePrySeat,
  type SimConfig,
} from "@neon-spore/sim";
import { gorgeIntakeY } from "./gorge-draw.js";
import { gorgePose, gorgePosed } from "./gorge-drift.js";
import { drawGripDial, drawGripRing } from "./grip-rings.js";
import { handleRadius } from "./handle-draw.js";
import { type Circle, hitCircle, type Layout, tileCX } from "./layout.js";
import type { Field, Touch } from "./touch.js";
import { bossOf } from "./touch-field.js";
import type { ViewRole } from "./view-role.js";
import { showsGorgePinch, showsGorgePry } from "./view-role-clocks-b.js";

/**
 * **THE GORGE's two thumbs**: the pinch on a full intake and the pry on the
 * mouth, drawn and answered in one file because the circle a thumb is
 * answered at is the circle the ring is drawn from.
 *
 * A ring stands in every lobe a seat's thumb could take this beat, on that
 * seat's screen alone (`showsGorgePinch`, `showsGorgePry`): the pilot's over
 * every full intake that is not the mouth, the navigator's over the mouth
 * once there is one. Which seat is which, and which intakes are on offer,
 * is the simulation's (`gorgePinchSeat`, `gorgePrySeat`, `gorgeOffers`,
 * `sim/gorge-hand.ts`), and the ring is
 * `queen-grip.ts`' — breathing until a thumb lands, filled once one has —
 * so a held intake and a held mark read as one gesture. The pry's ring
 * carries the dial as well: `gorgePryBeats` running out from the beat the
 * thumb landed, the one readout of the window on the screen that has to
 * fire inside it. The pinch has no dial, because a pinch has no window: it
 * holds for as long as the thumb does.
 *
 * The rings stand **in** the lobes rather than under them, where THE MIRROR's
 * do: the lobes hang off the top of the field with row 0 under them, and a
 * ring below the intake line would sit on the first creature to fall.
 */

/**
 * The ring in intake `i`: centred where the lobe swells, above the intake
 * line, and carried with the lobe as it leans at `beat` and `beatPhase`
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
  const root = { x: tileCX(l, g.col + i), y: gorgeIntakeY(l, g, cfg) };
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
 * is behind it. The thumb is a hold and not a pull: the simulation reads
 * only that it is down, on which intake, and on which beat.
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

/** How much of a pry's window is left, one to zero, from the beat it was taken. */
export function gorgePryLeft(
  g: GorgeState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  if (g.pry < 0) return 0;
  const into = beat - g.pryBeat + beatPhase;
  return Math.max(0, Math.min(1, 1 - into / cfg.gorgePryBeats));
}

/**
 * The rings, for the seats this screen is. Called after the sack is drawn,
 * so a ring stands on its lobe and nothing stands on the ring; the halo under
 * each and the verdict over it are `gorge-marks.ts`'.
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
  if (showsGorgePinch(role)) {
    for (const i of gorgeOffers(g, cfg, gorgePinchSeat)) {
      const c = gorgeGripCircle(l, cfg, g, i, beat, beatPhase);
      drawGripRing(ctx, c.x, c.y, c.r, g.pinch === i, time);
    }
  }
  if (showsGorgePry(role)) {
    for (const i of gorgeOffers(g, cfg, gorgePrySeat)) {
      const c = gorgeGripCircle(l, cfg, g, i, beat, beatPhase);
      const held = g.pry === i;
      drawGripRing(ctx, c.x, c.y, c.r, held, time);
      if (held) drawGripDial(ctx, c.x, c.y, c.r, gorgePryLeft(g, cfg, beat, beatPhase));
    }
  }
}
