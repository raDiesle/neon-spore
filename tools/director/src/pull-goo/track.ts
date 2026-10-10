import {
  PALETTE,
  PULL_TRACK_W,
  type PullTrack,
  type PullTrackDraw,
  pullTrackPoint,
} from "@neon-spore/render";
import { paintPullTrack } from "../../../../packages/render/src/pull-track.js";
import { goals, share } from "../../../versus/candidates/pull-handle/ooze/goo.js";
import { edge } from "./border.js";
import { type Ending, paintEnding } from "./ending.js";
import { paintFailure } from "./fail.js";
import { fieldSplash, overTail, underTail } from "./grab.js";
import { type GooMoment, momentOf } from "./moment.js";
import { paintPath } from "./parts.js";
import { sceneOf } from "./scene.js";
import { paintTail, specks, tailPath } from "./strand.js";
import type { GooStyle } from "./style.js";

/**
 * **The channel of a GOO look**: everything round the drop. Waiting or held,
 * OOZE's guides ahead of it — the dots to the end, the ghost, the turning
 * place; no ring of how far, the owner, 10 October 2026: *the green circle
 * indicator around the pull is not required* — and behind it only its green
 * tail and the specks it leaves; the red edge where its rim touches the limit.
 * Counted or refused, the channel draws the drop itself, through the look's
 * ending or the failure. Under all of it, SQUISH's splash where it was taken.
 */
export function gooTrack(style: GooStyle, ending: Ending) {
  return (ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void => {
    if (t.closed) {
      paintPullTrack(ctx, t, o);
      return;
    }
    const r = t.w / PULL_TRACK_W;
    const m = momentOf(o.held, o.time, o.after, r);
    ctx.save();
    fieldSplash(ctx, pullTrackPoint(t, o.origin), r, style, m.grabbed);
    if (m.owner === "ending") paintEnding(sceneOf(ctx, t, r, style, m, o.origin), ending);
    else if (m.owner === "failure") paintFailure(sceneOf(ctx, t, r, style, m, o.origin));
    else guides(ctx, t, o, r, style, m);
    ctx.restore();
  };
}

function guides(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  style: GooStyle,
  m: GooMoment,
): void {
  const ends = goals(o.origin, o.at);
  let p = 0;
  for (const g of ends) p = Math.max(p, share(o.origin, o.at, g));
  const run = { t, origin: o.origin, at: o.at, off: m.off };
  const moved = Math.abs(o.at - o.origin) > 0.005 || Math.hypot(m.off.x, m.off.y) > 1;
  if (o.held && moved) {
    const tip = pullTrackPoint(t, o.at);
    const hold = {
      at: { x: tip.x + m.off.x, y: tip.y + m.off.y },
      r,
      way: { x: 0, y: 0 },
      near: m.near,
      grabbed: m.grabbed,
      time: o.time,
    };
    const tail = tailPath(run, r, o.time, 0.4 * m.near);
    underTail(ctx, tail, hold);
    specks(ctx, run, r, 1);
    const blend = { run, color: style.neon, rim: r, span: r * 3 };
    paintTail(ctx, tail, PALETTE.good, 0.6 * m.near, 1, blend);
    overTail(ctx, run, hold, style, p);
  }
  paintPath(ctx, t, r, style, {
    origin: o.origin,
    at: o.at,
    held: o.held,
    time: o.time,
    enter: m.enter,
  });
  if (m.reach !== null && m.near > 0) edge(ctx, t, o.at, m.off, m.reach, r, m.near, o.time);
}
