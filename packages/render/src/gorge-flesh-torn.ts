import { PALETTE } from "./palette.js";

/**
 * THE GORGE's opening: the intake puckered under every lobe. Split off `gorge-flesh.ts`, whose
 * preamble says what the sack is made of and why.
 */

/**
 * How far a pucker gapes on its own, as a share of its height, and how fast in
 * radians a second. A still mouth under a lobe that breathes and beads that
 * swim read as a hole cut in the skin rather than a mouth in it.
 */
const PUCKER_GAPE = 0.3;
const PUCKER_RATE = 1.1;

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
  /** Wall-clock seconds and the lobe's seed, for the mouth's own gape. */
  time: number,
  seed: number,
): void {
  // Working on a clock of its own, off the beat and out of step with the
  // other mouths: wider as it opens, narrower as the lips purse.
  const gape = Math.sin(time * PUCKER_RATE + seed * 2.1);
  const rx = tile * 0.14 * (1 - PUCKER_GAPE * 0.4 * gape);
  const ry = tile * 0.06 * (1 + PUCKER_GAPE * gape);
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
