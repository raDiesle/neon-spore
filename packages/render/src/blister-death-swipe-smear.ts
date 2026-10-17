import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * SMEAR: wiped off the field the way it was stroked. The body is dragged out
 * along its channel, stretched long and thin, leaving a trail of fainter
 * copies of itself and three speed lines behind it — the stroke carried on
 * past the end, and the body with it.
 */
export function drawSmear(d: BlisterDying): void {
  const { ctx, x, y, poreY, way } = d;
  const t = during(d.at, 0, 0.8);
  const go = t * t * (1.4 - 0.4 * t);
  const reach = d.tile * 1.8;
  const along = way.dx !== 0;
  const stretch = 1 + 1.3 * Math.sin(Math.min(1, t * 1.4) * Math.PI * 0.5);
  const thin = 1 - 0.45 * t;
  const fade = 1 - during(d.at, 0.45, 1);
  lines(ctx, d, reach * go, fade);
  // The trail first, the body last and on top of it.
  for (let i = 4; i >= 0; i--) {
    const lag = go * (1 - i * 0.17);
    ctx.save();
    ctx.globalAlpha *= fade * (i === 0 ? 1 : 0.4 - i * 0.07);
    d.body(
      1,
      bendAbout(x, poreY, {
        dx: way.dx * reach * lag,
        dy: way.dy * reach * lag,
        sx: along ? stretch : thin,
        sy: along ? thin : stretch,
      }),
    );
    ctx.restore();
  }
  d.control(
    fade,
    bendAbout(x, y, { dx: way.dx * reach * go * 1.2, dy: way.dy * reach * go * 1.2 }),
  );
}

/** Three streaks along the way, behind where the body has got to. */
function lines(ctx: CanvasRenderingContext2D, d: BlisterDying, got: number, fade: number): void {
  const { x, y, r, way } = d;
  if (fade <= 0 || got <= r * 0.2) return;
  const nx = -way.dy;
  const ny = way.dx;
  ctx.save();
  ctx.lineCap = "round";
  for (const k of [-0.6, 0, 0.6]) {
    const ox = x + nx * r * k;
    const oy = y + ny * r * k;
    const from = got * 0.15 + Math.abs(k) * r * 0.5;
    ctx.beginPath();
    ctx.moveTo(ox + way.dx * from, oy + way.dy * from);
    ctx.lineTo(ox + way.dx * got, oy + way.dy * got);
    ctx.lineWidth = r * (k === 0 ? 0.16 : 0.09);
    ctx.strokeStyle = rgba(PALETTE.hullRim, 0.55 * fade);
    ctx.stroke();
  }
  ctx.restore();
}
