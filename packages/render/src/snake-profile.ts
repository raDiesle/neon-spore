import { PALETTE } from "./palette.js";

/**
 * SNAKE's head **from the side**, for the two buttons that are its mouth.
 *
 * The arena's head is seen from above (`snake-head.ts`), and from above an
 * open mouth is two jaws swung apart sideways — right on a tile the body walks,
 * and at the size of a button face a heart with eyes. From the side a mouth
 * opening is the one movement everybody reads at a glance: the upper jaw
 * lifts, the lower drops, the fangs show. So the buttons draw this one.
 *
 * Drawn facing +x about the hinge at the origin, in units of `s`; the caller
 * places and turns it. `gape` is 0 shut to 1 wide. The same violet rim
 * and the same eye as the arena's head, so it is the same animal turned round.
 */

/** How far each jaw swings at a full gape, in radians: the top lifts more. */
const UPPER = 0.62;
const LOWER = 0.42;

/** The skin's two ends — lighter than the arena head's, which has the lit
 * floor behind it; a face's dead fill is nearly its dark — and the fang. */
const SKIN_HI = "#7442C4";
const SKIN_LO = "#2A1150";
const FANG = "#F4E7FF";

export function drawSnakeProfile(ctx: CanvasRenderingContext2D, s: number, gape: number): void {
  const g = Math.max(0, Math.min(1, gape));
  const skin = ctx.createRadialGradient(s * 0.4, -s * 0.3, s * 0.05, s * 0.3, 0, s * 1.2);
  skin.addColorStop(0, SKIN_HI);
  skin.addColorStop(1, SKIN_LO);
  const rim = Math.max(1.2, s * 0.07);
  ctx.save();
  ctx.lineJoin = "round";
  ctx.lineCap = "round";
  neck(ctx, s, rim, skin);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = rim;
  ctx.fillStyle = skin;

  ctx.save();
  ctx.rotate(LOWER * g);
  const lower = new Path2D();
  lower.moveTo(0.05 * s, 0);
  lower.lineTo(0.92 * s, 0.03 * s);
  lower.quadraticCurveTo(0.92 * s, 0.17 * s, 0.68 * s, 0.21 * s);
  lower.quadraticCurveTo(0.2 * s, 0.3 * s, -0.25 * s, 0.24 * s);
  lower.quadraticCurveTo(-0.3 * s, 0.08 * s, 0.05 * s, 0);
  lower.closePath();
  ctx.fill(lower);
  ctx.stroke(lower);
  if (g > 0.05) fang(ctx, s, 0.72, -1);
  ctx.restore();

  ctx.save();
  ctx.rotate(-UPPER * g);
  const upper = new Path2D();
  upper.moveTo(-0.3 * s, 0.06 * s);
  upper.quadraticCurveTo(-0.4 * s, -0.46 * s, 0.1 * s, -0.5 * s);
  upper.quadraticCurveTo(0.58 * s, -0.53 * s, 0.86 * s, -0.3 * s);
  upper.quadraticCurveTo(1.1 * s, -0.15 * s, 1.06 * s, -0.01 * s);
  upper.lineTo(0.12 * s, 0.02 * s);
  upper.closePath();
  ctx.fill(upper);
  ctx.stroke(upper);
  if (g > 0.05) fang(ctx, s, 0.84, 1);
  eye(ctx, s);
  ctx.fillStyle = "rgba(10,6,22,.6)";
  ctx.beginPath();
  ctx.ellipse(0.94 * s, -0.13 * s, 0.05 * s, 0.035 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.restore();
}

/** The neck, going back and down out of the face behind the head. */
function neck(ctx: CanvasRenderingContext2D, s: number, rim: number, skin: CanvasGradient): void {
  ctx.beginPath();
  ctx.moveTo(-0.05 * s, 0.05 * s);
  ctx.quadraticCurveTo(-0.7 * s, 0.1 * s, -1.3 * s, 0.7 * s);
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = s * 0.46 + rim * 2;
  ctx.stroke();
  ctx.strokeStyle = skin;
  ctx.lineWidth = s * 0.46;
  ctx.stroke();
}

/** A fang off the jaw's edge at `at` along it, pointing into the mouth. */
function fang(ctx: CanvasRenderingContext2D, s: number, at: number, up: -1 | 1): void {
  ctx.fillStyle = FANG;
  ctx.beginPath();
  ctx.moveTo((at - 0.07) * s, 0.01 * s * up);
  ctx.lineTo(at * s, 0.2 * s * up);
  ctx.lineTo((at + 0.06) * s, 0.01 * s * up);
  ctx.closePath();
  ctx.fill();
}

/** The arena head's eye, side on: a socket, the iris, the slit. */
function eye(ctx: CanvasRenderingContext2D, s: number): void {
  const x = 0.44 * s;
  const y = -0.26 * s;
  ctx.fillStyle = "rgba(9,5,20,.85)";
  ctx.beginPath();
  ctx.ellipse(x, y, 0.15 * s, 0.12 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = PALETTE.hullRim;
  ctx.beginPath();
  ctx.ellipse(x + 0.01 * s, y, 0.11 * s, 0.085 * s, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = "#12061F";
  ctx.beginPath();
  ctx.ellipse(x + 0.03 * s, y, 0.035 * s, 0.08 * s, 0, 0, Math.PI * 2);
  ctx.fill();
}
