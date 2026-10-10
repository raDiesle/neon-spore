import type { Point } from "../../../../../packages/content/src/index.js";
import { noteMark } from "../../../../../packages/render/src/mark-spots.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { PullKnobDraw } from "../../../../../packages/render/src/pull-knob.js";
import {
  PULL_TRACK_W,
  type PullTrack,
  type PullTrackDraw,
  paintPullTrack,
  pullTrackPoint,
} from "../../../../../packages/render/src/pull-track.js";
import { drawWayArrow } from "../../../../../packages/render/src/way-arrow.js";

/**
 * **TENDON** — THE WARDEN's rope, made the look of every pull.
 *
 * - **Waiting**, the knob sits on a bolt, and a dashed guide flows from it to
 *   an open clamp at the far end: where to take it.
 * - **Held**, a braided cord runs from the bolt to the knob, thinner and
 *   hotter the further it is stretched; the clamp closes as the knob nears.
 * - **Full**, the clamp shuts on the knob and the cord burns green.
 *
 * The knob is a lit ball rather than a disc, its light from the top left like
 * every body on the field. A closed track (a wheel) is drawn as it ships.
 */

const FULL = 0.985;

function goals(origin: number, at: number): (0 | 1)[] {
  if (origin <= 0) return [1];
  if (origin >= 1) return [0];
  if (at > origin + 0.01) return [1];
  if (at < origin - 0.01) return [0];
  return [0, 1];
}

/** `n + 1` points along the track from `from` to `to`, as fractions. */
function along(t: PullTrack, from: number, to: number, n: number) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(pullTrackPoint(t, from + ((to - from) * i) / n));
  return out;
}

function stroke(ctx: CanvasRenderingContext2D, pts: readonly Point[]): void {
  ctx.beginPath();
  for (const [i, p] of pts.entries()) {
    if (i === 0) ctx.moveTo(p.x, p.y);
    else ctx.lineTo(p.x, p.y);
  }
  ctx.stroke();
}

/** Two strands twisted round the spine from the bolt to the knob. */
function cord(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw, r: number, p: number) {
  const n = 28;
  const spine = along(t, o.origin, o.at, n);
  const full = p >= FULL;
  const thick = r * (0.55 - 0.3 * p);
  const hex = full ? PALETTE.good : o.hex;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  // The glow of the strain, wider and brighter as it stretches.
  ctx.strokeStyle = hex;
  ctx.globalAlpha = 0.15 + 0.35 * p;
  ctx.lineWidth = thick * 2 + r * 0.6 * p;
  stroke(ctx, spine);
  for (const phase of [0, Math.PI]) {
    const strand = spine.map((q, i) => {
      const twist = Math.sin(i * 0.9 + phase - o.time * 6 * (o.held ? 1 : 0)) * thick * 0.5;
      return { x: q.x - q.dy * twist, y: q.y + q.dx * twist };
    });
    ctx.globalAlpha = 1;
    ctx.strokeStyle = phase === 0 ? (full ? PALETTE.goodRim : o.rim) : hex;
    ctx.lineWidth = thick * 0.9;
    stroke(ctx, strand);
  }
}

/** The clamp at an end: two jaws across the path, open until the knob nears. */
function clamp(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  goal: 0 | 1,
  r: number,
  p: number,
  o: PullTrackDraw,
) {
  const q = pullTrackPoint(t, goal);
  const full = p >= FULL;
  const open = full ? 0 : 1 - p * 0.75;
  const gap = r * (1.05 + 0.9 * open);
  ctx.strokeStyle = full ? PALETTE.good : p > 0 ? o.rim : o.hex;
  ctx.lineWidth = STROKE.outline * 2;
  ctx.lineCap = "round";
  ctx.globalAlpha = full ? 1 : 0.5 + 0.5 * p;
  for (const side of [-1, 1]) {
    const cx = q.x - q.dy * gap * side;
    const cy = q.y + q.dx * gap * side;
    const a = Math.atan2(q.dx * side, -q.dy * side);
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.9, a + Math.PI - 0.9, a + Math.PI + 0.9);
    ctx.stroke();
  }
  if (!full) return;
  const u = (o.time * 1.5) % 1;
  ctx.globalAlpha = 1 - u;
  ctx.lineWidth = STROKE.outline * (1 - u) * 2;
  ctx.beginPath();
  ctx.arc(q.x, q.y, r * (1.3 + 1.5 * u), 0, Math.PI * 2);
  ctx.stroke();
}

export function tendonTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  if (t.closed) {
    paintPullTrack(ctx, t, o);
    return;
  }
  const r = t.w / PULL_TRACK_W;
  ctx.save();
  let p = 0;
  for (const goal of goals(o.origin, o.at)) {
    const g = Math.abs(o.at - o.origin) / (Math.abs(goal - o.origin) || 1);
    p = Math.max(p, g);
    // The guide still to go, its dashes flowing the way the pull goes.
    ctx.setLineDash([r * 0.35, r * 0.45]);
    ctx.lineDashOffset = -o.time * r * 2.4;
    ctx.strokeStyle = o.hex;
    ctx.lineWidth = STROKE.outline;
    ctx.globalAlpha = 0.6;
    stroke(ctx, along(t, o.at, goal, 20));
    ctx.setLineDash([]);
    clamp(ctx, t, goal, r, g, o);
  }
  // The bolt the cord is tied to.
  const b = pullTrackPoint(t, o.origin);
  ctx.globalAlpha = 1;
  ctx.fillStyle = PALETTE.rockDark;
  ctx.strokeStyle = PALETTE.rock;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  ctx.arc(b.x, b.y, r * 0.45, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  if (Math.abs(o.at - o.origin) > 0.005) cord(ctx, t, o, r, p);
  ctx.restore();
}

/** The knob as a lit ball, with the way's arrow on it. */
export function tendonKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
): void {
  noteMark(ctx, at.x, at.y, r);
  ctx.save();
  if (!o.held && !o.theirs) {
    const breathe = 0.5 + 0.5 * Math.sin(o.time * 4);
    ctx.strokeStyle = o.hex;
    ctx.lineWidth = STROKE.inner;
    ctx.globalAlpha = 0.25 + 0.35 * breathe;
    ctx.beginPath();
    ctx.arc(at.x, at.y, r * (1.25 + 0.15 * breathe), 0, Math.PI * 2);
    ctx.stroke();
  }
  const ball = ctx.createRadialGradient(at.x - r * 0.35, at.y - r * 0.4, r * 0.1, at.x, at.y, r);
  ball.addColorStop(0, PALETTE.text);
  ball.addColorStop(0.35, o.held ? o.rim : o.hex);
  ball.addColorStop(1, PALETTE.background);
  ctx.globalAlpha = o.theirs ? 0.45 : 1;
  ctx.fillStyle = ball;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = o.held ? PALETTE.text : o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  if (o.way) {
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = PALETTE.background;
    ctx.lineWidth = STROKE.outline * 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawWayArrow(ctx, at.x, at.y, r * 1.1, o.way.dx, o.way.dy, o.time, o.either ? 2 : 1);
  }
  ctx.restore();
}
