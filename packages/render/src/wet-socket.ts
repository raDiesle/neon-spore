import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * **A wet hollow in whatever surface a body stands on**: darker than the
 * water round it, darkest at the bottom, with its lower inner wall catching
 * the light from above the way the inside of any hole does.
 *
 * Cut out of `pinball-socket.ts` when THE SCOUT's home wanted the same hollow
 * under its ring — a place on the water the ship is brought back *into*,
 * rather than a line drawn round a patch of the dark. `lip` is the lit wall's
 * width in pixels; the caller knows its own scale.
 */
export function drawWetSocket(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  rx: number,
  ry: number,
  lip: number,
): void {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(1, ry / rx);
  // The hollow: darkest at the bottom of it, gone by the lip.
  const deep = ctx.createRadialGradient(0, 0, rx * 0.2, 0, 0, rx);
  deep.addColorStop(0, rgba(PALETTE.background, 0.75));
  deep.addColorStop(0.7, rgba(PALETTE.background, 0.45));
  deep.addColorStop(1, rgba(PALETTE.background, 0));
  ctx.fillStyle = deep;
  ctx.beginPath();
  ctx.arc(0, 0, rx, 0, Math.PI * 2);
  ctx.fill();
  // The far wall, lit: the lower half of the rim, thinning to nothing at the
  // sides, and a wet film on it in the cold light.
  ctx.lineWidth = lip;
  ctx.strokeStyle = rgba(PALETTE.sheenCold, 0.55);
  ctx.beginPath();
  ctx.arc(0, 0, rx * 0.86, Math.PI * 0.12, Math.PI * 0.88);
  ctx.stroke();
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.35);
  ctx.lineWidth = lip * 0.6;
  ctx.beginPath();
  ctx.arc(0, 0, rx * 0.86, Math.PI * 0.3, Math.PI * 0.7);
  ctx.stroke();
  ctx.restore();
}
