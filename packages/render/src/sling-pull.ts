import { type SimConfig, type SlingState, slingAsks, slingLitStep } from "@neon-spore/sim";
import { type Circle, type Layout, seatOf } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { type PullWay, straightPullTrack } from "./pull-line.js";
import { drawPullTrack, pullTrackPoint } from "./pull-track.js";
import { drawSoakHold } from "./soak-hold.js";

/**
 * **THE SLING's cord while it is held**: the HOLD LAB's drop on the cord's
 * mark (`soak-hold.ts`; the owner, 13 October 2026, *it should be our new
 * standard button*), on both screens, the partner's dimmed, sunk while the
 * seat's thumb is down and its water the step's beats held so far.
 *
 * **Once its hold has counted**: a pull knob comes in where
 * the cord's mark was, and a fresh press carries it `slingPullMilli` toward
 * the lit side (`sim/sling-hand.ts`) — THE COMBO LAB's HOLD, THEN PULL, in
 * the game since the owner's word of 13 October 2026, in the field's one look
 * for a pull (`pull-knob.ts`, `pull-track.ts`).
 *
 * The channel and the arrow are on the cord's own seat's screen alone, since
 * a mark reads as *your next move*; the partner's screen has the knob dim, so
 * it can see the hand come across. The press is taken anywhere on the seat's
 * panel, as the hold's is (`sling-grip.ts`): the knob is where to look, not
 * the only place to land.
 */

/** Whether `side`'s cord asks its pull this frame: its hold counted, its step still asking. */
export function slingPulls(s: SlingState, side: 0 | 1): boolean {
  return s.held[side] && slingAsks(s, side);
}

/** The cord's pull, from its mark toward the lit side, a whole `slingPullMilli` long. */
function wayOf(s: SlingState): PullWay {
  return { dx: slingLitStep(s)?.aim === "left" ? -1 : 1, dy: 0 };
}

/** Whether `side`'s cord asks its hold this frame: its step asking, its beats not yet held. */
function slingHolds(s: SlingState, side: 0 | 1): boolean {
  return !s.held[side] && slingAsks(s, side);
}

/** The cord's hold as the drop, on its mark, under whatever answers it (`sling-verdicts.ts`). */
export function drawSlingHolds(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  s: SlingState,
  beatPhase: number,
  time: number,
  cords: readonly [Circle, Circle],
): void {
  const beats = Math.max(1, slingLitStep(s)?.beats ?? 1);
  for (const side of [0, 1] as const) {
    if (!slingHolds(s, side)) continue;
    const held = s.holding[side];
    const done = s.drawnBeats[side] + (held ? beatPhase : 0);
    const fill = Math.min(1, done / beats);
    const theirs = l.role !== "test" && seatOf(l.role) !== side + 1;
    drawSoakHold(ctx, cords[side], cords[side].r, { time, held, fill, theirs });
  }
}

export function drawSlingPulls(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: SlingState,
  time: number,
  /** Where this frame put each cord's mark, the knob's rest. */
  cords: readonly [Circle, Circle],
): void {
  const reach = Math.max(1, cfg.slingPullMilli);
  for (const side of [0, 1] as const) {
    if (!slingPulls(s, side)) continue;
    const mark = cords[side];
    const way = wayOf(s);
    const track = straightPullTrack({ from: mark, r: mark.r, way, len: (reach * l.tile) / 1000 });
    const at = Math.min(1, Math.max(0, s.pullMilli[side]) / reach);
    const held = s.pullMilli[side] >= 0;
    const mine = l.role === "test" || seatOf(l.role) === side + 1;
    const key = `sling:${side}`;
    if (mine) {
      drawPullTrack(ctx, track, {
        hex: PALETTE.hullRim,
        rim: PALETTE.text,
        held,
        origin: 0,
        at,
        time,
        key,
      });
    }
    const knob = pullTrackPoint(track, at);
    drawPullKnob(ctx, { x: knob.x, y: knob.y }, mark.r, {
      hex: mine ? PALETTE.hullRim : PALETTE.dim,
      rim: mine ? PALETTE.text : PALETTE.rock,
      held,
      time,
      way: mine ? way : null,
      theirs: !mine,
      key,
    });
  }
}
