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
 * **SLIME** — the pull is a drop of goo, the game's own material.
 *
 * - **Waiting**, the drop sits in a puddle and wobbles, leaning the way it
 *   wants to go; faint drops lie along the path like a trail to follow.
 * - **Held**, a sticky neck stretches from the puddle to the drop, thinner the
 *   further it goes, and the trail drops ahead swell as the drop reaches them.
 * - **Full**, the neck snaps: the puddle's half springs back, droplets fly,
 *   and the drop glows green.
 *
 * A closed track (a wheel) is a turn, not a pull, and is drawn as it ships.
 */

const FULL = 0.985;

function goals(origin: number, at: number): (0 | 1)[] {
  if (origin <= 0) return [1];
  if (origin >= 1) return [0];
  if (at > origin + 0.01) return [1];
  if (at < origin - 0.01) return [0];
  return [0, 1];
}

/** A blob round `at`: a circle whose rim wobbles in three lobes. */
function blob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  time: number,
  lean: Point,
  amt: number,
) {
  ctx.beginPath();
  const n = 28;
  for (let i = 0; i <= n; i++) {
    const a = (i / n) * Math.PI * 2;
    const ca = Math.cos(a);
    const sa = Math.sin(a);
    const wob = 1 + 0.07 * Math.sin(a * 3 + time * 5) + 0.04 * Math.sin(a * 2 - time * 3);
    // Pushed out on the side it leans towards.
    const push = 1 + amt * Math.max(0, ca * lean.x + sa * lean.y);
    const x = at.x + ca * r * wob * push;
    const y = at.y + sa * r * wob * push;
    if (i === 0) ctx.moveTo(x, y);
    else ctx.lineTo(x, y);
  }
  ctx.closePath();
}

/** The neck from the puddle to the drop: a ribbon, pinched in the middle. */
function neck(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw, r: number, p: number) {
  const n = 24;
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const u = i / n;
    const q = pullTrackPoint(t, o.origin + (o.at - o.origin) * u);
    const pinch = 1 - Math.sin(u * Math.PI) * (0.55 + 0.4 * p);
    const half = r * 0.7 * pinch * (1 - 0.35 * p);
    left.push({ x: q.x - q.dy * half, y: q.y + q.dx * half });
    right.push({ x: q.x + q.dy * half, y: q.y - q.dx * half });
  }
  ctx.beginPath();
  for (const [i, q] of left.entries()) {
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  for (let i = right.length - 1; i >= 0; i--)
    ctx.lineTo((right[i] as Point).x, (right[i] as Point).y);
  ctx.closePath();
}

export function slimeTrack(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw): void {
  if (t.closed) {
    paintPullTrack(ctx, t, o);
    return;
  }
  const r = t.w / PULL_TRACK_W;
  const ends = goals(o.origin, o.at);
  let p = 0;
  for (const g of ends) p = Math.max(p, Math.abs(o.at - o.origin) / (Math.abs(g - o.origin) || 1));
  const full = p >= FULL;
  const hex = full ? PALETTE.good : o.hex;
  ctx.save();
  // The trail: drops along the path, swelling as the drop comes near them.
  for (const g of ends) {
    for (let i = 1; i <= 6; i++) {
      const k = o.origin + ((g - o.origin) * i) / 6;
      const q = pullTrackPoint(t, k);
      const near = Math.max(0, 1 - Math.abs(k - o.at) * 5);
      const passed = (k - o.origin) * (g - o.origin) <= (o.at - o.origin) * (g - o.origin);
      ctx.fillStyle = passed && o.held ? PALETTE.good : hex;
      ctx.globalAlpha = passed && o.held ? 0.7 : 0.25 + 0.5 * near;
      const s = r * (i === 6 ? 0.55 : 0.18 + 0.2 * near);
      blob(ctx, q, s, o.time + i, { x: 0, y: 0 }, 0);
      ctx.fill();
    }
  }
  // The puddle the drop came out of.
  const home = pullTrackPoint(t, o.origin);
  ctx.globalAlpha = 0.45;
  ctx.fillStyle = hex;
  blob(ctx, home, r * 0.8, o.time * 0.7, { x: 0, y: 0 }, 0);
  ctx.fill();
  if (o.held && !full && Math.abs(o.at - o.origin) > 0.005) {
    ctx.globalAlpha = 0.75;
    neck(ctx, t, o, r, p);
    ctx.fill();
    ctx.globalAlpha = 1;
    ctx.strokeStyle = o.rim;
    ctx.lineWidth = STROKE.inner;
    ctx.stroke();
  }
  if (full) splash(ctx, t, o, r);
  ctx.restore();
}

/** The snap: droplets thrown off where the neck broke, on the clock. */
function splash(ctx: CanvasRenderingContext2D, t: PullTrack, o: PullTrackDraw, r: number) {
  const mid = pullTrackPoint(t, (o.origin + o.at) / 2);
  const u = (o.time * 1.1) % 1;
  ctx.fillStyle = PALETTE.good;
  for (let i = 0; i < 7; i++) {
    const a = i * 2.4 + 0.5;
    const d = r * (0.6 + 2.6 * u) * (0.7 + 0.3 * Math.sin(i * 7));
    ctx.globalAlpha = 0.9 * (1 - u);
    ctx.beginPath();
    ctx.arc(
      mid.x + Math.cos(a) * d,
      mid.y + Math.sin(a) * d,
      r * 0.18 * (1 - u * 0.6),
      0,
      Math.PI * 2,
    );
    ctx.fill();
  }
}

export function slimeKnob(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  o: PullKnobDraw,
): void {
  noteMark(ctx, at.x, at.y, r);
  ctx.save();
  const lean = o.way && !o.either ? { x: o.way.dx, y: o.way.dy } : { x: 0, y: 0 };
  // Waiting, it strains toward the way it goes; held, it is pulled round.
  const amt = o.held ? 0.08 : 0.12 + 0.1 * Math.max(0, Math.sin(o.time * 3));
  const body = ctx.createRadialGradient(
    at.x - r * 0.3,
    at.y - r * 0.35,
    r * 0.1,
    at.x,
    at.y,
    r * 1.1,
  );
  body.addColorStop(0, o.held ? PALETTE.text : o.rim);
  body.addColorStop(0.5, o.hex);
  body.addColorStop(1, o.held ? o.hex : PALETTE.background);
  ctx.globalAlpha = o.theirs ? 0.4 : 0.95;
  ctx.fillStyle = body;
  blob(ctx, at, r, o.time, lean, amt);
  ctx.fill();
  ctx.strokeStyle = o.held ? PALETTE.text : o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  // The wet shine, top left.
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(at.x - r * 0.35, at.y - r * 0.45, r * 0.22, r * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  if (o.way) {
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = PALETTE.background;
    ctx.lineWidth = STROKE.outline * 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawWayArrow(ctx, at.x, at.y, r * 1.1, o.way.dx, o.way.dy, o.time, o.either ? 2 : 1);
  }
  ctx.restore();
}
