import type { Point } from "../../../../../packages/content/src/index.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { PullTrackDraw } from "../../../../../packages/render/src/pull-track.js";
import { blob, dot, FULL, REFUSE_BURST } from "./goo.js";

/**
 * OOZE's two ends of a pull: the place the drop goes — a hollow drop the
 * size of the real one, so the eye sees *put it here* — and what happens
 * there or where it was let go: a green pop when counted, no word in it, and
 * a red burst where a refused drop lies.
 */

/**
 * The place the drop goes: its own outline, dashed and turning, filling as
 * the drop nears. Waiting, it fills for a moment each time the ghost arrives.
 */
export function socket(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  came: number,
  run: number | null,
  o: PullTrackDraw,
): void {
  if (came >= FULL || o.after?.verdict === "counted") return;
  const arrive = run === null ? 0 : Math.max(0, (run - 0.8) / 0.2);
  ctx.save();
  ctx.fillStyle = o.hex;
  ctx.globalAlpha = 0.1 + 0.3 * came + 0.3 * arrive;
  blob(ctx, q, r, o.time * 0.6);
  ctx.fill();
  ctx.setLineDash([r * 0.32, r * 0.24]);
  ctx.lineDashOffset = -o.time * r * 1.2;
  ctx.strokeStyle = came > 0 || arrive > 0 ? o.rim : o.hex;
  ctx.lineWidth = STROKE.outline * 1.3;
  ctx.globalAlpha = 0.55 + 0.45 * Math.max(came, arrive);
  ctx.stroke();
  ctx.restore();
}

/** A four-pointed star, COMET's mark of the whole way. */
function star(ctx: CanvasRenderingContext2D, at: Point, r: number, spin: number): void {
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const a = spin + (i * Math.PI) / 4;
    const d = i % 2 === 0 ? r : r * 0.36;
    if (i === 0) ctx.moveTo(at.x + Math.cos(a) * d, at.y + Math.sin(a) * d);
    else ctx.lineTo(at.x + Math.cos(a) * d, at.y + Math.sin(a) * d);
  }
  ctx.closePath();
}

/**
 * Counted, `s` seconds ago: the place fills green, a white flash and a
 * shockwave roll out, a star flares, and the drop's goo is thrown off in
 * droplets — then the green place itself shrinks away.
 */
export function popAt(
  ctx: CanvasRenderingContext2D,
  q: Point,
  r: number,
  s: number,
  time: number,
): void {
  ctx.save();
  const stay = s < 0.9 ? 1 : Math.max(0, 1 - (s - 0.9) / 0.7);
  if (stay > 0) {
    ctx.fillStyle = PALETTE.good;
    ctx.globalAlpha = 0.85 * Math.min(1, s / 0.12) * stay;
    blob(ctx, q, r * (0.4 + 0.65 * stay), time * 0.6);
    ctx.fill();
    ctx.strokeStyle = PALETTE.goodRim;
    ctx.lineWidth = STROKE.outline * 1.4;
    ctx.stroke();
  }
  if (s < 0.2) {
    const e = s / 0.2;
    ctx.strokeStyle = PALETTE.text;
    ctx.globalAlpha = 1 - e;
    ctx.lineWidth = STROKE.outline * 2.5;
    ctx.beginPath();
    ctx.arc(q.x, q.y, r * (1 + 0.7 * e), 0, Math.PI * 2);
    ctx.stroke();
  }
  if (s < 0.9) {
    const e = s / 0.9;
    ctx.fillStyle = PALETTE.good;
    ctx.globalAlpha = 1 - e;
    star(ctx, q, r * (0.8 + 1.6 * Math.sin(e * Math.PI * 0.5)), time * 2);
    ctx.fill();
  }
  if (s < 0.75) {
    const e = s / 0.75;
    const out = 1 - (1 - e) ** 2;
    ctx.strokeStyle = PALETTE.good;
    ctx.globalAlpha = 1 - e;
    ctx.lineWidth = STROKE.outline * 2.6 * (1 - e) + 0.3;
    ctx.beginPath();
    ctx.arc(q.x, q.y, r * (1.2 + 2.8 * out), 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = PALETTE.good;
    for (let i = 0; i < 11; i++) {
      const a = (i / 11) * Math.PI * 2 + 0.3;
      const d = r * (0.8 + 3.2 * out) * (0.75 + 0.25 * Math.sin(i * 5.3));
      const fall = r * 1.2 * e * e;
      dot(ctx, { x: q.x + Math.cos(a) * d, y: q.y + Math.sin(a) * d + fall }, r * 0.22 * (1 - e));
    }
  }
  ctx.restore();
}

/** Refused, `since` seconds ago: a red ring and jagged spikes round where the drop lies. */
export function refusedAt(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  since: number,
): void {
  const e = since / REFUSE_BURST;
  if (e >= 1) return;
  ctx.save();
  ctx.strokeStyle = PALETTE.red;
  ctx.globalAlpha = 1 - e;
  ctx.lineWidth = STROKE.outline * 2.6 * (1 - e) + 0.3;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * (1.2 + 1.5 * e), 0, Math.PI * 2);
  ctx.stroke();
  ctx.strokeStyle = PALETTE.redRim;
  ctx.lineCap = "round";
  ctx.lineWidth = STROKE.outline * 1.5;
  for (let i = 0; i < 8; i++) {
    const a = (i / 8) * Math.PI * 2 + Math.PI / 8;
    const d0 = r * (1.45 + 0.8 * e);
    const len = r * (i % 2 === 0 ? 0.75 : 0.45) * (1 - e * 0.5);
    ctx.beginPath();
    ctx.moveTo(at.x + Math.cos(a) * d0, at.y + Math.sin(a) * d0);
    ctx.lineTo(at.x + Math.cos(a) * (d0 + len), at.y + Math.sin(a) * (d0 + len));
    ctx.stroke();
  }
  ctx.restore();
}
