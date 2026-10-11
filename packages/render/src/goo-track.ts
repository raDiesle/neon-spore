import { edge } from "./goo-border.js";
import { paintEnding } from "./goo-ending.js";
import { paintFailure } from "./goo-fail.js";
import { FIZZ } from "./goo-fizz.js";
import { fieldSplash } from "./goo-grab.js";
import { type GooMoment, momentOf } from "./goo-moment.js";
import { paintPath } from "./goo-parts.js";
import { sceneOf } from "./goo-scene.js";
import { paintTail, specks, tailPath } from "./goo-strand.js";
import { GOO, type GooStyle } from "./goo-style.js";
import { PALETTE } from "./palette.js";
import { PULL_TRACK_W, type PullTrack, type PullTrackDraw, pullTrackPoint } from "./pull-track.js";
import { paintPullTrack } from "./pull-track-thin.js";

/**
 * **The channel of a GOO look**: everything round the drop. Waiting or held,
 * OOZE's guides ahead of it — the dots to the end, the ghost, the turning
 * place; no ring of how far, the owner, 10 October 2026: *the green circle
 * indicator around the pull is not required* — and behind it only its green
 * tail and the specks it leaves; the red edge where its rim touches the limit.
 * Counted or refused, the channel draws the drop itself, through the look's
 * ending or the failure. Under all of it, SQUISH's splash where it was taken.
 */
export function paintGooTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  if (t.closed) {
    paintPullTrack(ctx, t, o);
    return;
  }
  const r = t.w / PULL_TRACK_W;
  const m = momentOf(o.held, o.time, o.after, r);
  ctx.save();
  fieldSplash(ctx, pullTrackPoint(t, o.origin), r, GOO, m.grabbed);
  if (m.owner === "ending") paintEnding(sceneOf(ctx, t, r, GOO, m, o.origin), FIZZ);
  else if (m.owner === "failure") paintFailure(sceneOf(ctx, t, r, GOO, m, o.origin));
  else guides(ctx, t, o, r, GOO, m);
  ctx.restore();
}

function guides(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  style: GooStyle,
  m: GooMoment,
): void {
  const run = { t, origin: o.origin, at: o.at, off: m.off };
  const moved = Math.abs(o.at - o.origin) > 0.005 || Math.hypot(m.off.x, m.off.y) > 1;
  if (o.held && moved) {
    const tail = tailPath(run, r, o.time, 0.4 * m.near);
    specks(ctx, run, r, 1);
    const blend = { run, color: style.neon, rim: r, span: r * 3 };
    paintTail(ctx, tail, PALETTE.good, 0.6 * m.near, 1, blend);
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
