import type { HiveState, SimConfig } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import type { Circle, Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_DOWN } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W } from "./pull-track.js";
/**
 * **THE HIVE's haul, drawn as every pull is**: the PULL LAB's knob on the underside's
 * middle and a channel `hiveHaulMilli` straight down, filling green to the
 * deepest the carry has reached — the one figure the simulation keeps, so a
 * thumb resting at the top looks like no thumb, as THE CURTAIN's hem does
 * (`curtain-grip.ts`). The owner, 13 October 2026, on THE HIVE'S HAUL: *it
 * should also use same standard visuals*. The grab stays the wide circle
 * (`HAUL_GRAB`); the knob is every pull's size.
 */
export function drawHaulKnob(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  s: HiveState,
  c: Circle,
  time: number,
): void {
  const r = handleRadius(l, cfg);
  const len = (cfg.hiveHaulMilli * l.tile) / 1000;
  const share = Math.min(1, s.haulMilli / Math.max(1, cfg.hiveHaulMilli));
  const held = s.haulMilli > 0;
  const track = {
    pts: [
      { x: c.x, y: c.y },
      { x: c.x, y: c.y + len },
    ],
    w: r * PULL_TRACK_W,
  };
  drawPullTrack(ctx, track, { ...HAUL_LOOK, held, origin: 0, at: share, time, key: "hive" });
  const knob = { x: c.x, y: c.y + len * share };
  drawPullKnob(ctx, knob, r, { ...HAUL_LOOK, held, time, way: PULL_DOWN, key: "hive" });
}

/** The mass's own violet, and its lit rim: the hand takes the colour of what it holds. */
const HAUL_LOOK = { hex: PALETTE.hull, rim: PALETTE.hullRim } as const;
