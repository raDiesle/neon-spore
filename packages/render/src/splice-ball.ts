import { blobPoints } from "@neon-spore/content";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE SPLICE's numbers, as something to collect**: an amber drop of slime
 * with the digit in it, a halo, a glint and a drip — a power-up, because
 * getting it down the right straw is the prize (the owner, 25 September 2026).
 *
 * The amber is the pod's, which is what a pickup already is in this game, so
 * the ball reads as *take this* before its number is read. A ball already fed
 * is a green ghost of one — still there, because the order is what the
 * navigator is reading, and spent.
 *
 * Nothing here is held between frames: the wobble, the glint and the drip run
 * off the beat the caller hands in.
 */

export interface BallLook {
  /** 0 to 1: the rumble of a ball about to be taken — shaken and stretched. */
  shake: number;
  /** How opaque, for a ball seen through a pipe's wall. */
  alpha: number;
}

const STILL: BallLook = { shake: 0, alpha: 1 };

export function drawSlimeBall(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  r: number,
  b: number,
  seed: number,
  label: string,
  look: BallLook = STILL,
): void {
  const jig = look.shake * r * 0.16;
  const x = x0 + Math.sin(b * 41 + seed) * jig;
  const y = y0 + Math.cos(b * 53 + seed) * jig * 0.6;
  const stretch = 1 + look.shake * 0.18;
  ctx.globalAlpha = look.alpha;

  const pulse = 0.5 + 0.5 * Math.sin((b + seed * 0.25) * Math.PI);
  const halo = ctx.createRadialGradient(x, y, r * 0.6, x, y, r * (1.8 + 0.25 * pulse));
  halo.addColorStop(0, rgba(PALETTE.pod, 0.4 + 0.2 * look.shake));
  halo.addColorStop(1, rgba(PALETTE.pod, 0));
  ctx.fillStyle = halo;
  ctx.beginPath();
  ctx.arc(x, y, r * 2.1, 0, Math.PI * 2);
  ctx.fill();

  // The drip first, so the body sits over its root.
  const drip = (b * 0.4 + seed * 0.31) % 1;
  ctx.beginPath();
  ctx.moveTo(x - r * 0.3, y + r * 0.7);
  ctx.quadraticCurveTo(x, y + r * (1.15 + 0.45 * drip), x + r * 0.3, y + r * 0.7);
  ctx.fillStyle = PALETTE.ember;
  ctx.fill();

  const body = splinePath(
    blobPoints(x, y, r / Math.sqrt(stretch), r * stretch, 3, 0.025, 0.035, b * 0.6, seed, 28),
    true,
  );
  const fill = ctx.createRadialGradient(x - r * 0.35, y - r * 0.4, r * 0.1, x, y, r * 1.1);
  fill.addColorStop(0, PALETTE.podRim);
  fill.addColorStop(0.45, PALETTE.pod);
  fill.addColorStop(1, PALETTE.ember);
  ctx.fillStyle = fill;
  ctx.fill(body);
  ctx.strokeStyle = rgba(PALETTE.podDark, 0.55);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.stroke(body);

  // Two bubbles in the slime, and the wet glint on its upper left.
  ctx.fillStyle = rgba(PALETTE.podRim, 0.5);
  ctx.beginPath();
  ctx.arc(x + r * 0.42, y + r * 0.3, r * 0.1, 0, Math.PI * 2);
  ctx.arc(x - r * 0.3, y + r * 0.45, r * 0.07, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.text, 0.9);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.38, y - r * 0.42, r * 0.26, r * 0.13, -0.6, 0, Math.PI * 2);
  ctx.fill();

  // The pickup's twinkle, a four-point star riding the rim.
  const tw = Math.max(0, Math.sin((b * 0.5 + seed * 0.4) * Math.PI * 2));
  if (tw > 0.2) {
    const sx = x + r * 0.75;
    const sy = y - r * 0.7;
    const k = r * 0.45 * tw;
    ctx.beginPath();
    ctx.moveTo(sx, sy - k);
    ctx.lineTo(sx + k * 0.2, sy);
    ctx.lineTo(sx, sy + k);
    ctx.lineTo(sx - k * 0.2, sy);
    ctx.closePath();
    ctx.moveTo(sx - k, sy);
    ctx.lineTo(sx, sy + k * 0.2);
    ctx.lineTo(sx + k, sy);
    ctx.lineTo(sx, sy - k * 0.2);
    ctx.closePath();
    ctx.fillStyle = rgba(PALETTE.podRim, 0.9);
    ctx.fill();
  }

  const size = Math.max(9, Math.round(r * 1.15));
  ctx.font = `800 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.podDark;
  ctx.fillText(label, x, y + r * 0.05);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
  ctx.globalAlpha = 1;
}

/** A ball already fed: a green ghost with its number, no longer to be had. */
export function drawSpentBall(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  label: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.9, 0, Math.PI * 2);
  ctx.fillStyle = rgba(PALETTE.good, 0.12);
  ctx.fill();
  ctx.strokeStyle = rgba(PALETTE.good, 0.7);
  ctx.lineWidth = Math.max(1, r * 0.08);
  ctx.stroke();
  const size = Math.max(9, Math.round(r * 1.05));
  ctx.font = `700 ${size}px "Courier New",monospace`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillStyle = PALETTE.good;
  ctx.fillText(label, x, y);
  ctx.textAlign = "start";
  ctx.textBaseline = "alphabetic";
}

/**
 * Air rushing into a straw's top end round the ball it is about to take:
 * streaks drawn in from a ring toward the ball, faster and brighter as `amount`
 * goes from 0 to 1. The rumble's other half — a ball shaking for no reason
 * would be a ball that is broken.
 */
export function drawAirRush(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  b: number,
  amount: number,
): void {
  if (amount <= 0) return;
  const streaks = 9;
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, r * 0.1);
  for (let i = 0; i < streaks; i++) {
    const a = (i / streaks) * Math.PI * 2 + i * 0.7;
    // Each streak slides inward on its own phase and starts over outside.
    const f = (b * (1.5 + amount * 2) + i * 0.37) % 1;
    const outer = r * (3.1 - f * 1.6);
    const inner = Math.max(r * 1.15, outer - r * (0.7 + amount * 0.5));
    ctx.strokeStyle = rgba(PALETTE.podRim, amount * 0.7 * (1 - f * 0.5));
    ctx.beginPath();
    ctx.moveTo(x + Math.cos(a) * outer, y + Math.sin(a) * outer);
    ctx.lineTo(x + Math.cos(a) * inner, y + Math.sin(a) * inner);
    ctx.stroke();
  }
  ctx.lineWidth = 1;
}
