import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";

/**
 * THE GORGE's openings: the intake puckered under every lobe, and the flaps
 * of a lobe the beam has torn open. Split off `gorge-flesh.ts`, whose
 * preamble says what the sack is made of and why.
 */

/**
 * The intake, a puckered dark mouth under the lobe: its lower lip catching
 * the light in `lip`, its upper lip in the lobe's shadow.
 */
export function paintPucker(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  lip: string,
): void {
  const rx = tile * 0.14;
  const ry = tile * 0.06;
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(1, tile * 0.045);
  ctx.strokeStyle = PALETTE.sheenDeep;
  ctx.globalAlpha = 0.7;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, Math.PI * 1.1, Math.PI * 1.9);
  ctx.stroke();
  ctx.strokeStyle = lip;
  ctx.globalAlpha = 0.6;
  ctx.beginPath();
  ctx.ellipse(x, y + ry * 0.2, rx, ry, 0, Math.PI * 0.1, Math.PI * 0.9);
  ctx.stroke();
  ctx.restore();
}

/** A flap of torn skin hanging from a pierced lobe: dull, wet on its edge. */
export function paintFlap(
  ctx: CanvasRenderingContext2D,
  flap: Path2D,
  x: number,
  top: number,
  foot: number,
  tile: number,
): void {
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(flap);
  ctx.clip(flap);
  const shade = ctx.createLinearGradient(0, top, 0, foot);
  shade.addColorStop(0, rgba(PALETTE.rock, 0.3));
  shade.addColorStop(0.5, rgba(PALETTE.rock, 0));
  shade.addColorStop(1, rgba(PALETTE.sheenDeep, 0.6));
  ctx.fillStyle = shade;
  ctx.fill(flap);
  ctx.lineJoin = "round";
  ctx.lineWidth = tile * 0.06;
  ctx.strokeStyle = PALETTE.rock;
  ctx.globalAlpha = 0.35;
  ctx.stroke(flap);
  ctx.restore();
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.6);
  ctx.beginPath();
  ctx.arc(x, top + (foot - top) * 0.3, Math.max(0.8, tile * 0.025), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
