import { halo } from "../../../../../packages/render/src/glow.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";
import { DIAL_R } from "../../../../../packages/render/src/siren-dial.js";

/**
 * **A rotating beacon** — the lamp on a roof: a glass dome on a dark base with
 * a mirror turning inside it, and the beam the mirror throws sweeping the top
 * of the screen. One beam for a call, slow and cool; for a torch the dome goes
 * red, the mirror turns three times as fast and throws two beams, and the
 * whole dome flashes white each time a beam passes the front.
 */
export function beaconSiren(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  time: number,
  torch: boolean,
): void {
  const r = DIAL_R;
  const glass = torch ? PALETTE.red : PALETTE.cyan;
  const turn = time * Math.PI * 2 * (torch ? 1.1 : 0.35);
  const beams = torch ? 2 : 1;
  const reach = torch ? 190 : 120;
  // How square-on a beam is to the viewer: 1 when it points straight down
  // the screen, which is when the dome flashes.
  let facing = 0;
  for (let b = 0; b < beams; b++) {
    facing = Math.max(facing, Math.max(0, Math.sin(turn + (b * Math.PI * 2) / beams)));
  }

  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  for (let b = 0; b < beams; b++) {
    const a = turn + (b * Math.PI * 2) / beams;
    const grad = ctx.createRadialGradient(cx, cy, r * 0.4, cx, cy, reach);
    grad.addColorStop(0, `${glass}aa`);
    grad.addColorStop(0.4, `${glass}33`);
    grad.addColorStop(1, `${glass}00`);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.moveTo(cx, cy);
    ctx.arc(cx, cy, reach, a - 0.28, a + 0.28);
    ctx.closePath();
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";

  // The base it stands on.
  ctx.fillStyle = "#0D1117";
  ctx.beginPath();
  ctx.roundRect(cx - r * 1.05, cy + r * 0.35, r * 2.1, r * 0.6, 3);
  ctx.fill();
  ctx.strokeStyle = "#2A2547";
  ctx.lineWidth = 1.2;
  ctx.stroke();

  // The dome: dark glass lit from inside by the mirror.
  const dome = ctx.createRadialGradient(cx, cy - r * 0.1, r * 0.1, cx, cy, r);
  dome.addColorStop(0, torch ? PALETTE.redRim : PALETTE.cyanRim);
  dome.addColorStop(0.55, glass);
  dome.addColorStop(1, torch ? PALETTE.redDark : PALETTE.cyanDark);
  ctx.fillStyle = dome;
  ctx.globalAlpha = 0.65 + 0.35 * facing;
  ctx.beginPath();
  ctx.arc(cx, cy + r * 0.35, r * 0.95, Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  // The mirror inside, a bar seen edge-on as it turns.
  ctx.globalAlpha = 0.9;
  ctx.fillStyle = PALETTE.text;
  const w = Math.abs(Math.cos(turn)) * r * 0.7 + 1.5;
  ctx.fillRect(cx - w / 2, cy - r * 0.3, w, r * 0.55);
  // A glint on the glass.
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  ctx.ellipse(cx - r * 0.42, cy - r * 0.15, r * 0.12, r * 0.28, -0.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.globalAlpha = 1;
  ctx.restore();

  if (torch) halo(ctx, cx, cy, r * 5, PALETTE.text, 0.35 * facing ** 6);
  halo(ctx, cx, cy, r * 2.6, glass, 0.2 + 0.25 * facing);
}
