import type { Point } from "@neon-spore/content";
import {
  PULL_TRACK_W,
  type PullTrack,
  type PullTrackDraw,
  pullTrackPoint,
} from "@neon-spore/render";
import { paintPullTrack } from "../../../../packages/render/src/pull-track.js";
import { bodyPath } from "./body.js";
import { drip, fizz } from "./fx.js";
import { chevrons, paintBand } from "./guide.js";
import {
  DROP_IN,
  droppingIn,
  type GooMoment,
  goals,
  IMPACT,
  momentOf,
  redness,
  SNAP,
  share,
} from "./moment.js";
import { clamp01 } from "./noise.js";
import { countSplash } from "./splash.js";
import { paintStrand, specks, strandPath, strandPoint } from "./strand.js";
import type { GooStyle } from "./style.js";

/**
 * **The channel of a GOO look**: everything round the drop. The band the
 * hand may wander in and its middle, the place the drop goes, the strand it
 * is pulled out of and the specks it leaves, the chevrons ahead — and the
 * splash when it is counted, the snap when it fails. The drop is `knob.ts`.
 */
export function gooTrack(style: GooStyle) {
  return (ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void => {
    if (t.closed) {
      paintPullTrack(ctx, t, o);
      return;
    }
    const r = t.w / PULL_TRACK_W;
    const m = momentOf(o.held, o.time, o.after);
    const ends = goals(o.origin, o.at);
    const q = pullTrackPoint(t, o.at);
    const drop = { k: o.at, at: { x: q.x + m.off.x, y: q.y + m.off.y } };
    let p = 0;
    for (const g of ends) p = Math.max(p, share(o.origin, o.at, g));
    ctx.save();
    paintBand(ctx, t, m, r, style, drop);
    if (m.counted === null)
      for (const g of ends) place(ctx, pullTrackPoint(t, g), r, share(o.origin, o.at, g), style, m);
    if ((m.held && m.counted === null) || (m.counted ?? 1) < IMPACT)
      pulled(ctx, t, o, r, p, style, m);
    else if (m.counted !== null || m.failed !== null) {
      const fade = 1 - clamp01((m.counted ?? m.failed ?? 0) / 0.8);
      if (fade > 0) specks(ctx, t, o, r, style, fade);
    }
    if (m.failed !== null && m.failed < SNAP) snapped(ctx, t, o, r, p, style, m);
    const falling = (droppingIn(m) ?? DROP_IN) < DROP_IN;
    if (m.counted === null && m.failed === null && !m.crawling && !falling)
      for (const g of ends) chevrons(ctx, t, o.at, g, r, style, m);
    if (m.counted !== null && ends.length === 1)
      countSplash(ctx, pullTrackPoint(t, ends[0] as 0 | 1), r, m.counted, style, o.time);
    ctx.restore();
  };
}

/** The place the drop goes: a lumpy dashed print of a drop, filling as the drop nears. */
function place(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  came: number,
  style: GooStyle,
  m: GooMoment,
): void {
  const pulse = m.held ? 0 : 0.5 + 0.5 * Math.sin(m.time * 3.4);
  const p = bodyPath({ at, r: r * 1.05, seed: 37 }, style, m.time * 0.5);
  ctx.save();
  ctx.fillStyle = style.body;
  ctx.globalAlpha = 0.07 + 0.3 * came + 0.06 * pulse;
  ctx.fill(p);
  ctx.setLineDash([r * 0.3, r * 0.22]);
  ctx.lineDashOffset = -m.time * r * 0.8;
  ctx.strokeStyle = style.neon;
  ctx.globalAlpha = 0.35 + 0.55 * came;
  ctx.lineWidth = r * 0.09;
  ctx.stroke(p);
  ctx.restore();
}

/** While held: the strand, the specks behind it, and what the style hangs or boils off it. */
function pulled(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  p: number,
  style: GooStyle,
  m: GooMoment,
): void {
  if (Math.abs(o.at - o.origin) < 0.005 && Math.hypot(m.off.x, m.off.y) < 1) return;
  specks(ctx, t, o, r, style, 1);
  paintStrand(
    ctx,
    strandPath(t, o, m.off, r, { from: 0, to: 1, seed: 3, p }),
    style,
    redness(m),
    1,
  );
  for (const [i, u] of [0.3, 0.62].entries()) {
    const s = strandPoint(t, o, m.off, u);
    if (style.drips) drip(ctx, s, r * 0.7, o.time, 20 + i, style, 0.6);
    if (style.fizz)
      fizz(ctx, s, r * 0.7, o.time, { seed: 30 + i, n: 2, spread: r * 0.3, style, alpha: 0.5 });
  }
}

/** Failed: the strand breaks at its waist and whips back into its two ends. */
function snapped(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  o: PullTrackDraw,
  r: number,
  p: number,
  style: GooStyle,
  m: GooMoment,
): void {
  if (Math.abs(o.at - o.origin) < 0.01) return;
  const e = 1 - (1 - clamp01((m.failed ?? 0) / SNAP)) ** 2;
  const reach = 0.5 * (1 - e);
  const red = redness(m);
  const a = strandPath(t, o, m.off, r, { from: 0, to: reach, seed: 3, p, pinch: "to" });
  const b = strandPath(t, o, m.off, r, { from: 1 - reach, to: 1, seed: 3, p, pinch: "from" });
  paintStrand(ctx, a, style, red, 1 - e * 0.5);
  paintStrand(ctx, b, style, red, 1 - e * 0.5);
}
