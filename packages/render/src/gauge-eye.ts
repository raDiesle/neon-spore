import type { Point } from "@neon-spore/content";
import { halo } from "./glow.js";
import { mixHex, rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **One of THE GAUGE's eyes**, out of `gauge-face.ts` when it stopped being a
 * flat almond. The owner, 7 October 2026: *more details and 3d depth*. From
 * the back to the front:
 *
 * - **a socket** sunk into the flesh round it, darkest just over the lid;
 * - **a brow** over it, a ridge lit on its top edge from the key;
 * - **the eyeball**, rounded by a light off its upper left and shaded under
 *   the upper lid so it sits *in* the head;
 * - **the iris**, bright at its middle and ringed dark at its edge, with the
 *   slit and two catchlights — a big one toward the light, a faint one back
 *   off the far side.
 *
 * Still the alien's own venom and never an ammunition colour (`gauge-face.ts`).
 */

const EYE_DEEP = "#1A0F08";
const BALL_LIT = "#4A3818";
const SLIT = "#050308";
const SHADOW = "#0B1024";
const BROW = mixHex("#4A3360", PALETTE.venom, 0.35);

/**
 * The eye at `at`, `w` from its middle to either corner and `h` high when wide
 * open, its corners tilted `tilt`, the iris turned toward `look`, open by
 * `open` (0..1).
 */
export function drawGaugeEye(
  ctx: CanvasRenderingContext2D,
  w: number,
  hFull: number,
  at: Point,
  tilt: number,
  look: Point,
  open: number,
  time: number,
): void {
  const h = hFull * open;
  const pulse = 0.5 + 0.5 * Math.sin(time * 2.3);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(tilt);
  drawSocket(ctx, w, hFull);
  ctx.restore();
  halo(ctx, at.x, at.y, w * 1.9, PALETTE.venom, 0.16 + 0.1 * pulse);
  ctx.save();
  ctx.translate(at.x, at.y);
  ctx.rotate(tilt);

  const lid = almond(w, h);
  const ball = ctx.createRadialGradient(-w * 0.3, -h * 0.5, 0, 0, 0, w);
  ball.addColorStop(0, BALL_LIT);
  ball.addColorStop(0.55, EYE_DEEP);
  ball.addColorStop(1, "#070403");
  ctx.fillStyle = ball;
  ctx.fill(lid);
  ctx.save();
  ctx.clip(lid);
  // The iris slides a little towards where the cannon points.
  const dx = look.x - at.x;
  const dy = look.y - at.y;
  const d = Math.hypot(dx, dy) || 1;
  const cos = Math.cos(-tilt);
  const sin = Math.sin(-tilt);
  const ix = ((dx * cos - dy * sin) / d) * w * 0.4;
  const iy = ((dx * sin + dy * cos) / d) * hFull * 0.3;
  const ir = hFull * 0.85;
  const iris = ctx.createRadialGradient(ix - ir * 0.25, iy - ir * 0.3, 0, ix, iy, ir);
  iris.addColorStop(0, mixHex(PALETTE.venom, PALETTE.venomRim, 0.6));
  iris.addColorStop(0.45, PALETTE.venom);
  iris.addColorStop(0.85, PALETTE.venomDeep);
  iris.addColorStop(1, mixHex(PALETTE.venomDeep, SLIT, 0.5));
  ctx.fillStyle = iris;
  ctx.beginPath();
  ctx.arc(ix, iy, ir, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = SLIT;
  ctx.beginPath();
  ctx.ellipse(ix, iy, ir * 0.24, ir * 0.9, 0, 0, Math.PI * 2);
  ctx.fill();
  // The upper lid's shade on the ball: it sits under the lid, not on it.
  const shade = ctx.createLinearGradient(0, -h, 0, h * 0.2);
  shade.addColorStop(0, rgba(SHADOW, 0.75));
  shade.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = shade;
  ctx.fillRect(-w, -h, w * 2, h * 1.2);
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.85);
  ctx.beginPath();
  ctx.arc(ix - ir * 0.35, iy - ir * 0.4, ir * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.hullRim, 0.3);
  ctx.beginPath();
  ctx.arc(ix + ir * 0.38, iy + ir * 0.42, ir * 0.08, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  ctx.strokeStyle = PALETTE.venom;
  ctx.lineWidth = 1.8;
  ctx.stroke(lid);
  ctx.restore();
}

/**
 * The hollow the eye sits in and the brow over it, neither of which closes
 * when the eye does: drawn at the eye's full height whatever `open` is.
 */
function drawSocket(ctx: CanvasRenderingContext2D, w: number, h: number): void {
  ctx.save();
  ctx.scale(1, 0.6);
  const r = w * 1.45;
  const g = ctx.createRadialGradient(0, -h * 0.5, 0, 0, 0, r);
  g.addColorStop(0, rgba(SHADOW, 0.95));
  g.addColorStop(0.6, rgba(SHADOW, 0.6));
  g.addColorStop(1, rgba(SHADOW, 0));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.arc(0, 0, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.lineCap = "round";
  const brow = new Path2D();
  brow.moveTo(-w * 1.2, -h * 0.5);
  brow.quadraticCurveTo(0, -h * 3.1, w * 1.2, -h * 0.5);
  // The underside of the ridge, then its lit crown a little toward the light.
  ctx.strokeStyle = rgba(SHADOW, 0.9);
  ctx.lineWidth = h * 0.55;
  ctx.stroke(brow);
  ctx.save();
  ctx.translate(0, -h * 0.22);
  ctx.strokeStyle = rgba(BROW, 0.75);
  ctx.lineWidth = h * 0.22;
  ctx.stroke(brow);
  ctx.restore();
}

/** A pointed eye shape, `w` from the middle to either corner and `h` high. */
function almond(w: number, h: number): Path2D {
  const p = new Path2D();
  p.moveTo(-w, 0);
  p.quadraticCurveTo(0, -h * 2, w, 0);
  p.quadraticCurveTo(0, h * 2, -w, 0);
  p.closePath();
  return p;
}
