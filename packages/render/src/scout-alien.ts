import { halo } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { drawWetSocket } from "./wet-socket.js";

/**
 * **What makes THE SCOUT's pacman alien** (`scout-ship.ts`): two feelers with
 * lit tips off its back, and a wet eye with a slit pupil in it — both in the
 * one green on the field that belongs to nothing the pair must dodge or
 * fetch. Split off the ship on its line count.
 */

/** Two feelers off the back, swaying, each with a lit bead on the end. */
export function drawFeelers(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  back: number,
  time: number,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.hull;
  ctx.lineWidth = Math.max(1, r * 0.12);
  for (const side of [-1, 1]) {
    const a = back + side * 0.55 + 0.12 * Math.sin(time * 4 + side);
    const bx = x + Math.cos(a) * r * 0.8;
    const by = y + Math.sin(a) * r * 0.8;
    const tx = x + Math.cos(a) * r * 1.55;
    const ty = y + Math.sin(a) * r * 1.55;
    ctx.beginPath();
    ctx.moveTo(bx, by);
    ctx.quadraticCurveTo(
      bx + Math.cos(a + side) * r * 0.4,
      by + Math.sin(a + side) * r * 0.4,
      tx,
      ty,
    );
    ctx.stroke();
    halo(ctx, tx, ty, r * 0.5, PALETTE.good, 0.5);
    ctx.fillStyle = PALETTE.goodRim;
    ctx.beginPath();
    ctx.ellipse(tx, ty, r * 0.13, r * 0.13, 0, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
}

/** The eye: a wet socket with a green slit pupil in it, and a glint. */
export function drawAlienEye(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  drawWetSocket(ctx, x, y, r * 0.3, r * 0.26, Math.max(1, r * 0.07));
  ctx.save();
  ctx.fillStyle = PALETTE.good;
  ctx.beginPath();
  // It blinks, briefly, once every few seconds.
  const blink = (time * 0.4) % 1 < 0.04 ? 0.15 : 1;
  ctx.ellipse(x, y, r * 0.07, r * 0.19 * blink, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = rgba(PALETTE.goodRim, 0.9);
  ctx.beginPath();
  ctx.ellipse(x - r * 0.08, y - r * 0.08, r * 0.05, r * 0.05, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
