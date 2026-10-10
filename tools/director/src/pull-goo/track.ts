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
import { type GooMoment, momentOf } from "./moment.js";
import { ghost, runway, socket } from "./parts.js";
import { sceneOf } from "./scene.js";
import { paintTail, specks, tailPath } from "./strand.js";
import type { GooStyle } from "./style.js";

/**
 * **The channel of a GOO look**: everything round the drop. Waiting or held,
 * OOZE's guides ahead of it — the dots to the end, the ghost, the turning
 * place; no ring of how far, the owner, 10 October 2026: *the green circle
 * indicator around the pull is not required* — and behind it only its green
 * tail and the specks it leaves; the red edge where its rim touches the limit. Counted or refused,
 * the channel draws the drop itself, through the look's ending or the failure.
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
  const waiting = !o.held && p < 0.01;
  const run = { t, origin: o.origin, at: o.at, off: m.off };
  const moved = Math.abs(o.at - o.origin) > 0.005 || Math.hypot(m.off.x, m.off.y) > 1;
  if (o.held && moved) {
    specks(ctx, run, r, 1);
    paintTail(ctx, tailPath(run, r, o.time, 0.4 * m.near), PALETTE.good, 0.6 * m.near, 1);
  }
  for (const g of ends) {
    const came = share(o.origin, o.at, g);
    runway(ctx, t, r, style, { origin: o.origin, goal: g, came, held: o.held, time: o.time });
    socket(ctx, pullTrackPoint(t, g), r, style, { came, waiting, time: o.time });
    if (waiting) ghost(ctx, t, r, style, { origin: o.origin, goal: g, time: o.time });
  }
  if (m.reach !== null && m.near > 0) edge(ctx, t, o.at, m.off, m.reach, r, m.near, o.time);
}
