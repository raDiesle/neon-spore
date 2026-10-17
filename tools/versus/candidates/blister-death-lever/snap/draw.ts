import {
  type BlisterDying,
  bendAbout,
  during,
} from "../../../../../packages/render/src/blister-death.js";
import { sinHash } from "../../../../../packages/render/src/hash.js";
import { rgba } from "../../../../../packages/render/src/hex.js";
import { PALETTE } from "../../../../../packages/render/src/palette.js";

/**
 * SNAP: the lever breaks. Its cord snaps at the pore with a jagged yellow
 * crack, and the body, held down all that while, springs up off the tile,
 * tumbling, then falls back past where it stood and into its hole.
 */
export function drawLeverSnap(d: BlisterDying): void {
  const { ctx, x, y, r, poreY } = d;
  const side = sinHash(d.seed, 5) < 0.5 ? -1 : 1;
  const t = d.age;
  // Thrown up, and falling back down into the pore.
  const lift = -r * 7 * t + r * 11 * t * t;
  const turn = side * Math.PI * 2.2 * t;
  ctx.save();
  ctx.globalAlpha *= 1 - during(d.at, 0.8, 1);
  d.body(1, bendAbout(x, y, { dy: lift, dx: side * r * 0.6 * t, turn }));
  ctx.restore();
  d.control(1 - during(d.at, 0, 0.18));
  crack(ctx, x, poreY, r, during(d.at, 0, 0.35));
}

/** The break: two jagged yellow strokes out of the pore and a flash between them. */
function crack(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, t: number): void {
  if (t <= 0 || t >= 1) return;
  const a = 1 - t;
  ctx.save();
  ctx.lineJoin = "miter";
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y, r * (0.4 + 0.5 * t), 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.podRim, 0.6 * a);
  ctx.fill();
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.moveTo(x + side * r * 0.2, y);
    ctx.lineTo(x + side * r * 0.55, y + r * 0.25);
    ctx.lineTo(x + side * r * 0.7, y - r * 0.05);
    ctx.lineTo(x + side * (r * 1.1 + r * 0.5 * t), y + r * 0.3);
    ctx.lineWidth = r * 0.14 * a;
    ctx.strokeStyle = rgba(PALETTE.lamp, a);
    ctx.stroke();
  }
  ctx.restore();
}
