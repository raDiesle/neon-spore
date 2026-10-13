import type { Point } from "@neon-spore/content";
import { drawPullKnob } from "./pull-knob.js";
import type { PullWay } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W } from "./pull-track.js";

/**
 * **A pull that may go either way across**: the PULL LAB's knob on a level
 * channel `reach` out each side of `at`, starting in the middle with an arrow
 * of two heads (`pull-knob.ts`, `pull-track.ts`). Once the thumb carries it,
 * the knob rides toward that side, its arrow that way alone, and the channel
 * fills green behind it — so the end of the channel is the end of the pull,
 * said before the lift. On the seat that does not own it, the knob has no
 * arrow and is drawn as the partner's.
 *
 * THE WARDEN's hatch was the first (`warden-track.ts`), the owner, 13 October
 * 2026: *same standard visuals*; THE GAUGE's tongue is the second, the same
 * day (`gauge-tongue-grip.ts`). The marks round it — halo, dashed ring, clock
 * — are each caller's, because each is ringed round a different thing.
 */
export interface TwoWayPull {
  /** The knob's radius. */
  knob: number;
  /** How far the channel runs out each side. */
  reach: number;
  /** How far along the knob is, −1..1, signed the way it goes. */
  along: number;
  /** Whether this screen is the seat that pulls it. */
  mine: boolean;
  hex: string;
  rim: string;
  /** One per pull on the field (`PullMemory`). */
  key: string;
  time: number;
}

export function drawTwoWayPull(ctx: CanvasRenderingContext2D, at: Point, p: TwoWayPull): void {
  const fill = Math.max(-1, Math.min(1, p.along));
  const pts = [
    { x: at.x - p.reach, y: at.y },
    { x: at.x + p.reach, y: at.y },
  ];
  const held = fill !== 0;
  const look = { hex: p.hex, rim: p.rim, held, time: p.time, key: p.key };
  drawPullTrack(
    ctx,
    { pts, w: p.knob * PULL_TRACK_W },
    { ...look, origin: 0.5, at: 0.5 + fill / 2 },
  );
  drawPullKnob(ctx, { x: at.x + fill * p.reach, y: at.y }, p.knob, {
    ...look,
    way: p.mine ? (fill < 0 ? LEFT : RIGHT) : null,
    either: fill === 0,
    theirs: !p.mine,
  });
}

const LEFT: PullWay = { dx: -1, dy: 0 };
const RIGHT: PullWay = { dx: 1, dy: 0 };
