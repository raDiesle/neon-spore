import type { Point } from "@neon-spore/content";
import { type PullTrack, pullTrackPoint } from "@neon-spore/render";
import { goals } from "../../../versus/candidates/pull-handle/ooze/goo.js";
import { lengthOf } from "./beat.js";
import type { GooMoment } from "./moment.js";
import type { GooStyle } from "./style.js";

/**
 * What an ending and a failure are drawn from: the track, the drop's size,
 * where it was when the verdict came and where it goes home to, and the end
 * it was going to. Built once a frame by the channel (`track.ts`).
 */
export interface Scene {
  readonly ctx: CanvasRenderingContext2D;
  readonly t: PullTrack;
  readonly r: number;
  readonly style: GooStyle;
  readonly m: GooMoment;
  readonly time: number;
  /** Where the pull starts, along the track, and the end the verdict was given towards. */
  readonly origin: number;
  readonly goal: 0 | 1;
  /** The drop where the verdict found it, its start, and the place at the end. */
  readonly from: Point;
  readonly home: Point;
  readonly place: Point;
}

export function sceneOf(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  r: number,
  style: GooStyle,
  m: GooMoment,
  origin: number,
): Scene {
  const goal = goals(origin, m.from.at)[0] ?? 1;
  const q = pullTrackPoint(t, m.from.at);
  return {
    ctx,
    t,
    r,
    style,
    m,
    time: m.time,
    origin,
    goal,
    from: { x: q.x + m.from.off.x, y: q.y + m.from.off.y },
    home: pullTrackPoint(t, origin),
    place: pullTrackPoint(t, goal),
  };
}

/**
 * A point `k` along the track, and past either end of it along the end's own
 * heading — so a drop flung home can overshoot its start and come back.
 */
export function trackAt(t: PullTrack, k: number): Point & { dx: number; dy: number } {
  const q = pullTrackPoint(t, k);
  if (k >= 0 && k <= 1) return q;
  const past = (k < 0 ? k : k - 1) * lengthOf(t);
  return { ...q, x: q.x + q.dx * past, y: q.y + q.dy * past };
}

/** Along the way home from the place: `u` 0 at the place, 1 at the start, past 1 beyond it. */
export function homeward(s: Scene, u: number): Point & { dx: number; dy: number } {
  const q = trackAt(s.t, s.goal + (s.origin - s.goal) * u);
  const sign = s.origin > s.goal ? 1 : -1;
  return { x: q.x, y: q.y, dx: q.dx * sign, dy: q.dy * sign };
}
