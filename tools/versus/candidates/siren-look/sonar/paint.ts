import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { DIAL_R } from "../../../../../packages/render/src/siren-dial.js";

/**
 * **A sonar ping** — no lamp at all: a bright core, and rings leaving it and
 * spreading across the top of the screen until they fade. A call sends one
 * cool ring at a time, at walking pace. A torch sends three at once, in ember,
 * fast and thick, and the core beats hard on each one that leaves.
 */
export function sonarSiren(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  torch: boolean,
): void {
  const r = DIAL_R;
  const hue = torch ? PALETTE.ember : PALETTE.cyan;
  const rim = torch ? PALETTE.emberRim : PALETTE.cyanRim;
  const hz = torch ? 1.6 : 0.6;
  const rings = torch ? 3 : 2;
  const reach = torch ? 180 : 120;
  const phase = (time * hz) % 1;

  ctx.save();
  for (let i = 0; i < rings; i++) {
    const p = (phase + i / rings) % 1;
    ctx.globalAlpha = (1 - p) ** 1.5 * (torch ? 0.9 : 0.6);
    ctx.strokeStyle = i === 0 ? rim : hue;
    ctx.lineWidth = (torch ? 4 : 2) * (1 - p) + 0.5;
    ctx.beginPath();
    ctx.arc(cx, cy, r * 0.9 + p * (reach - r), 0, Math.PI * 2);
    ctx.stroke();
  }

  // The core: a dark disc with a bright heart that beats as a ring leaves.
  const beat = (1 - ((time * hz * rings) % 1)) ** 3;
  ctx.globalAlpha = 0.92;
  ctx.fillStyle = "#0D1117";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.strokeStyle = hue;
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = hue;
  ctx.beginPath();
  ctx.arc(cx, cy, r * (0.42 + 0.18 * beat), 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.text;
  ctx.beginPath();
  ctx.arc(cx, cy, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  halo(ctx, cx, cy, r * (torch ? 4 : 2.8), hue, (torch ? 0.3 : 0.18) + 0.25 * beat);
}
