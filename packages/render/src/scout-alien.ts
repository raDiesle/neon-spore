import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { drawWetSocket } from "./wet-socket.js";

/**
 * **THE SCOUT's eye** (`scout-ship.ts`): a wet socket with a slit pupil in
 * it, in the one green on the field that belongs to nothing the pair must
 * dodge or fetch — the same green as the feelers' tips (`scout-shell.ts`).
 * Split off the ship on its line count.
 */

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
