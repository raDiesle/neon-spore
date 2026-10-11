import type { Point } from "@neon-spore/content";
import { type PullTrack, pullTrackPoint, smoothstep } from "@neon-spore/render";
import {
  blob,
  dot,
  FULL,
  GHOST_RUN,
  goals,
  share,
} from "../../../versus/candidates/pull-handle/ooze/goo.js";
import { bodyPath } from "./body.js";
import { dotIn, entering, placeIn } from "./enter.js";
import type { GooStyle } from "./style.js";

/**
 * **What GOO keeps of OOZE**, the owner's base (10 October 2026): *it has
 * most visible starting visuals and it has the progress circle around, and a
 * nice rotating shape and the blinking dots as well showing path with real
 * projection where to go and where to stop.* OOZE's own contour (`blob`)
 * in GOO's tar and neon — but only the dots still ahead of the drop: the
 * ones it has passed are gone, and what it leaves is its green tail and
 * specks (`strand.ts`). The progress circle went later the same day: *the
 * green circle indicator around the pull is not required*.
 */

/** Put a thumb here: a breathing halo and ripples out of the drop, two at a time. */
export function call(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  style: GooStyle,
  time: number,
): void {
  const breathe = 0.5 + 0.5 * Math.sin(time * 4);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.7, at.x, at.y, r * 2.5);
  halo.addColorStop(0, style.neon);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.16 + 0.18 * breathe;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.save();
  ctx.strokeStyle = style.neon;
  for (const lag of [0, 0.5]) {
    const u = (time * 0.85 + lag) % 1;
    ctx.globalAlpha = 0.8 * (1 - u);
    ctx.lineWidth = r * 0.12 * (1 - u) + 0.3;
    ctx.stroke(bodyPath({ at, r: r * (1.15 + 1.25 * u), seed: 29 }, style, time));
  }
  ctx.restore();
}

/** How many dots a path has between its start and its end. */
export function dotCount(t: PullTrack, r: number): number {
  return Math.max(4, Math.round(lengthOf(t) / r)) - 1;
}

/** The dots from the drop to the end, the next one blinking while it is held, lit one
 * after another by the ghost while it waits, and coming in one after another with a
 * blink while the path comes in (`enter`, `enter.ts`). `came` is how far the drop has come. */
export function runway(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  r: number,
  style: GooStyle,
  o: { origin: number; goal: 0 | 1; came: number; held: boolean; time: number; enter: number },
): void {
  const dots = dotCount(t, r);
  const ghostAt = smoothstep((o.time / GHOST_RUN) % 1);
  ctx.save();
  for (let i = 1; i <= dots; i++) {
    const along = i / (dots + 1);
    if (along <= o.came + 1e-6 && o.came > 0.01) continue;
    const come = dotIn(i, dots, o.enter);
    if (!come) continue;
    const q = pullTrackPoint(t, o.origin + (o.goal - o.origin) * along);
    let lit = come.blink;
    if (!o.held && along <= ghostAt && !entering(o.enter))
      lit = Math.max(lit, 1 - (ghostAt - along) * 3.2);
    if (o.held && along - o.came < 1 / (dots + 1) + 1e-6) lit = Math.max(lit, blinkAt(o.time));
    ctx.fillStyle = style.neon;
    if (lit > 0.3) {
      ctx.globalAlpha = 0.22 * lit;
      dot(ctx, q, r * 0.5 * come.size);
    }
    ctx.fillStyle = lit > 0.05 ? style.neon : style.core;
    ctx.globalAlpha = 0.35 + 0.65 * lit;
    blob(ctx, q, r * (0.14 + 0.1 * lit) * come.size, o.time + along * 7);
    ctx.fill();
  }
  ctx.restore();
}

/** The blink of whatever is next ahead of a held drop: a dot, then the place. */
function blinkAt(time: number): number {
  return 0.5 + 0.5 * Math.sin(time * 12);
}

/** The path ahead of a drop at `at` along the track: the dots, the place at each end it
 * may go to, and the ghost while it waits — each coming in as `enter` says. */
export function paintPath(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  r: number,
  style: GooStyle,
  o: { origin: number; at: number; held: boolean; time: number; enter: number },
): void {
  const ends = goals(o.origin, o.at);
  let p = 0;
  for (const g of ends) p = Math.max(p, share(o.origin, o.at, g));
  const waiting = !o.held && p < 0.01;
  const dots = dotCount(t, r);
  for (const g of ends) {
    const came = share(o.origin, o.at, g);
    runway(ctx, t, r, style, {
      origin: o.origin,
      goal: g,
      came,
      held: o.held,
      time: o.time,
      enter: o.enter,
    });
    socket(ctx, pullTrackPoint(t, g), r, style, {
      came,
      held: o.held,
      waiting,
      time: o.time,
      enter: o.enter,
      dots,
    });
    if (waiting && !entering(o.enter))
      ghost(ctx, t, r, style, { origin: o.origin, goal: g, time: o.time });
  }
}

/** A see-through drop running the whole pull, from the start to the place it goes. */
export function ghost(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  r: number,
  style: GooStyle,
  o: { origin: number; goal: 0 | 1; time: number },
): void {
  const run = (o.time / GHOST_RUN) % 1;
  const q = pullTrackPoint(t, o.origin + (o.goal - o.origin) * smoothstep(run));
  const a = 0.55 * Math.sin(run * Math.PI);
  const p = bodyPath({ at: q, r: r * 0.92, seed: 13 }, style, o.time);
  ctx.save();
  ctx.globalAlpha = 0.3 * a;
  ctx.fillStyle = style.body;
  ctx.fill(p);
  ctx.globalAlpha = a;
  ctx.strokeStyle = style.neon;
  ctx.lineWidth = r * 0.08;
  ctx.stroke(p);
  ctx.restore();
}

/**
 * The place the drop goes: OOZE's turning dashed drop, filling as the drop
 * nears and for a moment each time the ghost arrives, popping in with a blink
 * after the last dot while the path comes in (`enter.ts`). Held past the last
 * dot, it blinks as the dots did, the next thing ahead — the owner, 11 October
 * 2026: *when the path dots are blinking and reach the last one, also the
 * placeholder should blink next*.
 */
export function socket(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  style: GooStyle,
  o: { came: number; held: boolean; waiting: boolean; time: number; enter: number; dots: number },
): void {
  if (o.came >= FULL) return;
  const come = placeIn(o.dots, o.enter);
  if (!come) return;
  const run = (o.time / GHOST_RUN) % 1;
  const arrive = o.waiting && !entering(o.enter) ? Math.max(0, (run - 0.8) / 0.2) : 0;
  const next = o.held && 1 - o.came < 1 / (o.dots + 1) + 1e-6;
  const blink = next ? blinkAt(o.time) : 0;
  const lit = next ? blink : Math.max(o.came, arrive, come.blink);
  const rr = r * Math.max(0.01, come.size) * (1 + 0.12 * blink);
  ctx.save();
  if (blink > 0.3) {
    ctx.fillStyle = style.neon;
    ctx.globalAlpha = 0.22 * blink;
    dot(ctx, q, rr * 1.25);
  }
  ctx.fillStyle = style.body;
  ctx.globalAlpha = 0.35 + 0.4 * lit;
  blob(ctx, q, rr, o.time * 0.6);
  ctx.fill();
  ctx.setLineDash([rr * 0.32, rr * 0.24]);
  ctx.lineDashOffset = -o.time * rr * 1.2;
  ctx.strokeStyle = style.neon;
  ctx.lineWidth = rr * 0.1;
  ctx.globalAlpha = 0.55 + 0.45 * lit;
  ctx.stroke();
  ctx.restore();
}

export function lengthOf(t: PullTrack): number {
  let len = 0;
  for (let i = 1; i < t.pts.length; i++) {
    const a = t.pts[i - 1] as Point;
    const b = t.pts[i] as Point;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len;
}
