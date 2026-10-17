import { bendAbout, during } from "./blister-bend.js";
import type { BlisterDying } from "./blister-death.js";
import { smoothstep } from "./ease.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * PLUNGE: the tap goes all the way in. The blow presses the body flat onto
 * its pore like a button bottoming out — a click of yellow rings and ticks off
 * the lip — and the flattened body is pushed on down into the hole and gone.
 */
export function drawPlunge(d: BlisterDying): void {
  const { ctx, x, r, poreY } = d;
  const press = smoothstep(during(d.at, 0, 0.14));
  const relax = during(d.at, 0.14, 0.5);
  const sink = during(d.at, 0.14, 0.62);
  // Bottomed out: wide and flat on the lip, then sprung half back as it goes.
  const sy = 1 - 0.6 * press + 0.25 * relax;
  const sx = 1 + 0.4 * press - 0.2 * relax;
  const h = 1 - sink * sink;
  const fade = 1 - during(d.at, 0.62, 1);
  ctx.save();
  ctx.globalAlpha *= fade;
  d.body(Math.max(0, h), bendAbout(x, poreY, { sx, sy }));
  ctx.restore();
  // The press goes in with it, under the lip by the time the body is.
  d.control(1 - during(d.at, 0.1, 0.4), bendAbout(x, poreY, { sx, sy: sy * (0.4 + 0.6 * h) }));
  click(ctx, x, poreY, r, during(d.at, 0.1, 0.55));
}

/** The click: two flat rings out along the skin and four ticks off the lip. */
function click(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  if (t <= 0 || t >= 1) return;
  const a = 1 - t;
  ctx.save();
  ctx.lineCap = "round";
  for (const [k, w] of [
    [1, 0.16],
    [0.7, 0.1],
  ] as const) {
    const reach = r * (0.9 + 1.8 * t * k);
    ctx.beginPath();
    ctx.ellipse(x, y, reach, reach * 0.3, 0, 0, Math.PI * 2);
    ctx.lineWidth = r * w * a;
    ctx.strokeStyle = rgba(PALETTE.lamp, 0.85 * a);
    ctx.stroke();
  }
  ctx.lineWidth = r * 0.14;
  ctx.strokeStyle = rgba(PALETTE.podRim, a);
  for (const side of [-1, 1]) {
    for (const lift of [0.35, -0.15]) {
      const from = r * (1 + 0.9 * t);
      ctx.beginPath();
      ctx.moveTo(x + side * from, y - r * lift);
      ctx.lineTo(x + side * (from + r * 0.45), y - r * lift * 1.6);
      ctx.stroke();
    }
  }
  ctx.restore();
}
