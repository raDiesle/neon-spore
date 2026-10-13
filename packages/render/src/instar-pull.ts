import type { Point } from "@neon-spore/content";
import type { InstarGesture, SceneMark, SimConfig } from "@neon-spore/sim";
import { handleRadius } from "./handle-draw.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { drawPullKnob } from "./pull-knob.js";
import { PULL_DOWN, PULL_UP, type PullWay } from "./pull-line.js";
import { drawPullTrack, PULL_TRACK_W, type PullTrack } from "./pull-track.js";

/**
 * **THE INSTAR's pulls, drawn as every pull is**: a PULL DOWN, a PULL UP and a
 * SWIPE DOWN mark wear the PULL LAB's knob on the part, its arrow the mark's
 * way, on a channel as long as the carry the simulation counts — the mark's
 * own `need` for a pull, `instarSwipeMilli` for a swipe — filling green as
 * the part gives (`pull-knob.ts`, `pull-track.ts`). The owner, 13 October
 * 2026, on THE INSTAR'S MARKS: *it should also use same standard visuals*.
 *
 * The other gestures — a tap, a turn, a hold, the panel's presses — are not a
 * carry, and keep their ring (`instar-ring.ts`). The window still closes on
 * the mark as a ring round it (`instar-together.ts`), because it is the
 * step's clock and not the handle.
 */

/** The way each carried gesture goes, and nothing for the rest. */
const WAYS: Partial<Record<InstarGesture, PullWay>> = {
  pullDown: PULL_DOWN,
  pullUp: PULL_UP,
  swipeDown: PULL_DOWN,
};

/** Whether a mark is a carry, and so drawn as a pull. */
export function instarMarkPulls(gesture: InstarGesture): boolean {
  return WAYS[gesture] !== undefined;
}

/** A pull mark's channel from where it is grabbed, or `null` for a mark that is not a carry. */
export function instarPullTrack(
  l: Layout,
  cfg: SimConfig,
  mark: Pick<SceneMark, "gesture" | "need">,
  at: Point,
): PullTrack | null {
  const way = WAYS[mark.gesture];
  if (way === undefined) return null;
  const milli = mark.gesture === "swipeDown" ? cfg.instarSwipeMilli : mark.need;
  const len = (Math.max(0, milli) * l.tile) / 1000;
  return {
    pts: [
      { x: at.x, y: at.y },
      { x: at.x + way.dx * len, y: at.y + way.dy * len },
    ],
    w: handleRadius(l, cfg) * PULL_TRACK_W,
  };
}

/** The box a mark takes at `at`: the point, or a pull's whole channel. */
export function instarPullSpan(
  l: Layout,
  cfg: SimConfig,
  mark: Pick<SceneMark, "gesture" | "need">,
  at: Point,
): { left: number; right: number; top: number; bottom: number } {
  const end = instarPullTrack(l, cfg, mark, at)?.pts[1] ?? at;
  return {
    left: Math.min(at.x, end.x),
    right: Math.max(at.x, end.x),
    top: Math.min(at.y, end.y),
    bottom: Math.max(at.y, end.y),
  };
}

/**
 * The knob and its channel, `share` of the way along. The arrow is on the
 * seat the mark wants; on the other screen it is the partner's knob, with
 * none (`pull-knob.ts`).
 */
export function drawInstarPull(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  cfg: SimConfig,
  mark: Pick<SceneMark, "gesture" | "need">,
  at: Point,
  o: { mine: boolean; held: boolean; share: number; time: number; key: string },
): void {
  const track = instarPullTrack(l, cfg, mark, at);
  const way = WAYS[mark.gesture];
  if (track === null || way === undefined) return;
  const share = Math.max(0, Math.min(1, o.share));
  const { held, time, key } = o;
  drawPullTrack(ctx, track, { ...LOOK, held, origin: 0, at: share, time, key });
  const end = track.pts[1] ?? at;
  const knob = { x: at.x + (end.x - at.x) * share, y: at.y + (end.y - at.y) * share };
  drawPullKnob(ctx, knob, handleRadius(l, cfg), {
    ...LOOK,
    held,
    time,
    way: o.mine ? way : null,
    theirs: !o.mine,
    key,
  });
}

/** The marks' red, and its lit rim: every mark on this body is red (`instar-ring.ts`). */
const LOOK = { hex: PALETTE.red, rim: PALETTE.redRim } as const;
