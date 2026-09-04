import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The move from one player's screen to the other, made followable.
 *
 * The owner's instruction was that the switch must be something a pair can
 * *follow* — a cut between two screens that look alike is a screen that seems
 * to have changed by itself, and the whole lesson of the tutorial is that there
 * are two devices and they carry different halves. So the picture slides
 * (`guide-scene.ts` owns the slide), a lit seam travels with the join, and a
 * banner names the screen that has arrived.
 *
 * Its own file beside the stage because it is the one part of the rehearsal
 * that is pure decoration: nothing here reads a world, and removing it would
 * change how the film feels and not what it says.
 */

/** How far the seam's glow reaches either side of the join. */
const SEAM = 5;
/** Where the banner sits, and how tall it is. A caption keeps clear of it. */
export const BANNER_TOP = 30;
export const BANNER_H = 22;

/** The join between the outgoing and incoming screens, lit as it travels. */
export function drawSwitchSeam(ctx: CanvasRenderingContext2D, l: Layout, x: number): void {
  const g = ctx.createLinearGradient(x - SEAM, 0, x + SEAM, 0);
  g.addColorStop(0, "rgba(255,86,168,0)");
  g.addColorStop(0.5, "rgba(255,86,168,.42)");
  g.addColorStop(1, "rgba(255,86,168,0)");
  ctx.fillStyle = g;
  ctx.fillRect(x - SEAM, 0, SEAM * 2, l.height);
}

/**
 * Whose screen this is, across the top. It fades in with the slide and stays
 * for the rest of the step: a pair who looked away and back has to be able to
 * answer "which of us is this" without waiting for the next switch.
 */
export function drawSeatBanner(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seat: 1 | 2,
  k: number,
): void {
  if (k <= 0) return;
  const text = seat === 1 ? "PLAYER 1 · THIS SCREEN" : "PLAYER 2 · THE OTHER SCREEN";
  ctx.font = '700 11px "Courier New",monospace';
  const w = ctx.measureText(text).width + 22;
  const x = (l.width - w) / 2;

  ctx.globalAlpha = k;
  ctx.fillStyle = "rgba(9,7,20,.9)";
  ctx.fillRect(x, BANNER_TOP, w, BANNER_H);
  ctx.strokeStyle = seat === 1 ? PALETTE.hullRim : PALETTE.cyan;
  ctx.lineWidth = 1.2;
  ctx.strokeRect(x + 0.5, BANNER_TOP + 0.5, w - 1, BANNER_H - 1);
  ctx.fillStyle = seat === 1 ? PALETTE.hullRim : PALETTE.cyan;
  ctx.textAlign = "center";
  ctx.fillText(text, l.width / 2, BANNER_TOP + 15);
  ctx.textAlign = "left";
  ctx.globalAlpha = 1;
}
