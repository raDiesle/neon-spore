import type { Point } from "@neon-spore/content";
import { PALETTE, type PullTrack, pullTrackPoint } from "@neon-spore/render";
import { glow } from "./body.js";
import type { GooMoment } from "./moment.js";
import { fbm, mix } from "./noise.js";
import type { GooStyle } from "./style.js";

/**
 * **What tells the hand where to go**: the band it may wander in, the ideal
 * line down its middle, and the chevrons running ahead of the drop — the
 * owner on OOZE, 10 October 2026: *the arrow … is the most important element
 * that player knows to do something and what to do*, and *if player pulls it
 * too far outside of the tolerance, it's clearly visible it's too far away
 * from the ideal path in its middle*.
 */

function total(t: PullTrack): number {
  let len = 0;
  for (let i = 1; i < t.pts.length; i++) {
    const a = t.pts[i - 1] as Point;
    const b = t.pts[i] as Point;
    len += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return len || 1;
}

/** One wall of the band, `side` (±1) of the path, creeping a hair so it is goo, not a rule. */
function wall(t: PullTrack, reach: number, side: 1 | -1, time: number, r: number): Path2D {
  const p = new Path2D();
  const len = total(t);
  const n = Math.max(16, Math.round(len / (r * 0.5)));
  for (let i = 0; i <= n; i++) {
    const q = pullTrackPoint(t, i / n);
    const d = side * reach + fbm(((i / n) * len) / (r * 2) + time * 0.3, side + 4) * r * 0.1;
    if (i === 0) p.moveTo(q.x - q.dy * d, q.y + q.dx * d);
    else p.lineTo(q.x - q.dy * d, q.y + q.dx * d);
  }
  return p;
}

/**
 * The band and its middle. Faint while the hand is well inside; the wall the
 * drop is nearing heats to red beside it, and a red thread ties the drop to
 * the middle it has left. Off the path past the wall, both walls flash red.
 */
export function paintBand(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  m: GooMoment,
  r: number,
  style: GooStyle,
  drop: { k: number; at: Point },
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (m.reach !== null) {
    const strayed =
      m.failed !== null && Math.hypot(m.off.x, m.off.y) > m.reach * 0.8 ? 1 - m.failed / 0.9 : 0;
    const color = mix(mix(style.neon, PALETTE.dim, 0.55), PALETTE.red, Math.max(strayed, 0));
    for (const side of [1, -1] as const) {
      const w = wall(t, m.reach, side, m.time, r);
      ctx.strokeStyle = color;
      ctx.globalAlpha = 0.3 + 0.5 * Math.max(0, strayed);
      ctx.lineWidth = 0.8 + 1.2 * Math.max(0, strayed);
      ctx.setLineDash([r * 0.5, r * 0.35]);
      ctx.stroke(w);
    }
    ctx.setLineDash([]);
    if (m.warn > 0) heat(ctx, t, m, r, drop);
  }
  // The middle: the ideal line, ahead of the drop only.
  ctx.strokeStyle = PALETTE.text;
  ctx.globalAlpha = 0.16;
  ctx.lineWidth = 0.9;
  ctx.setLineDash([2, 4]);
  ctx.beginPath();
  for (let i = 0; i <= 30; i++) {
    const q = pullTrackPoint(t, i / 30);
    if (i === 0) ctx.moveTo(q.x, q.y);
    else ctx.lineTo(q.x, q.y);
  }
  ctx.stroke();
  ctx.restore();
}

/** The wall beside a drop that is nearing it, red-hot, and the thread back to the middle. */
function heat(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  m: GooMoment,
  r: number,
  drop: { k: number; at: Point },
): void {
  const reach = m.reach ?? 0;
  const q = pullTrackPoint(t, drop.k);
  const side = m.off.x * -q.dy + m.off.y * q.dx >= 0 ? 1 : -1;
  const len = total(t);
  const seg = new Path2D();
  for (let i = -8; i <= 8; i++) {
    const s = pullTrackPoint(t, drop.k + (i / 8) * ((r * 2.4) / len));
    const x = s.x - s.dy * side * reach;
    const y = s.y + s.dx * side * reach;
    if (i === -8) seg.moveTo(x, y);
    else seg.lineTo(x, y);
  }
  glow(ctx, seg, PALETTE.red, r * 0.6, m.warn * 1.4);
  ctx.strokeStyle = PALETTE.red;
  ctx.globalAlpha = m.warn;
  ctx.lineWidth = 1.6;
  ctx.stroke(seg);
  ctx.setLineDash([2, 3]);
  ctx.globalAlpha = m.warn * 0.75;
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(q.x, q.y);
  ctx.lineTo(drop.at.x, drop.at.y);
  ctx.stroke();
  ctx.setLineDash([]);
}

/**
 * Chevrons marching from the drop towards `to`, bright, glowing in the
 * slime's neon round a white core: big while the drop waits for a thumb,
 * smaller once it is taken. Never past the end.
 */
export function chevrons(
  ctx: CanvasRenderingContext2D,
  t: PullTrack,
  from: number,
  to: number,
  r: number,
  style: GooStyle,
  m: GooMoment,
): void {
  const len = total(t);
  const span = Math.abs(to - from) * len;
  const way = to > from ? 1 : -1;
  const size = m.held ? r * 0.42 : r * (0.62 + 0.08 * Math.sin(m.time * 6));
  const gap = m.held ? r * 1.2 : r * 1.35;
  const first = m.held ? r * 1.9 : r * 2.1;
  const drift = ((m.time * (m.held ? 2.2 : 1.5)) % 1) * gap;
  const count = m.held ? 2 : 3;
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  for (let j = -1; j < count; j++) {
    const d = first + j * gap + drift;
    if (d < first - gap * 0.2 || d > span - r * 0.6) continue;
    const q = pullTrackPoint(t, from + (way * d) / len);
    const fx = q.dx * way;
    const fy = q.dy * way;
    const fade = Math.min(1, (d - first + gap * 0.2) / (gap * 0.6), (span - r * 0.6 - d) / r);
    const lead = 1 - (j + 1) / (count + 1);
    const v = new Path2D();
    v.moveTo(q.x - fx * size - fy * size, q.y - fy * size + fx * size);
    v.lineTo(q.x, q.y);
    v.lineTo(q.x - fx * size + fy * size, q.y - fy * size - fx * size);
    glow(ctx, v, style.neon, r * 0.9, fade * (0.6 + 0.6 * lead));
    ctx.strokeStyle = PALETTE.background;
    ctx.globalAlpha = 0.8 * fade;
    ctx.lineWidth = r * 0.34;
    ctx.stroke(v);
    ctx.strokeStyle = mix(style.neon, "#FFFFFF", 0.6);
    ctx.globalAlpha = fade * (0.55 + 0.45 * lead);
    ctx.lineWidth = r * 0.17;
    ctx.stroke(v);
  }
  ctx.restore();
}
