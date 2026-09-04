import { readyFraction, readyHeld, seatReady, type World } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * One seat's circle at the gate a guide ends on: a dim track, an arc for the
 * fill, its name above and READY under it once it is full.
 *
 * `sim/ready-gate.ts` owns every rule of it — this only reads how full each one
 * is. The arc starts at the top and runs clockwise, which is the direction
 * every loading indicator has ever gone; this is not the moment to be
 * interesting about it.
 *
 * **Both circles are drawn on both screens**, and that is the whole reason it
 * is a two-player gesture rather than two solo ones: you can see your partner
 * is still reading, or that they finished a while ago and are waiting on you. A
 * screen that drew only its own circle would be the same feature with the
 * meaning taken out.
 *
 * **They are gauges and never buttons.** The gate has a button of its own
 * (`ready-page.ts`), and it has to: BACK is on the same screen, so a press
 * anywhere cannot mean READY.
 *
 * Yours is the brighter of the two and named YOU, theirs is dimmed and named
 * THEM. In `test` — one person at a desk holding both seats — neither is
 * "yours", so they are named PLAYER ONE and PLAYER TWO and drawn alike.
 *
 * Its own file rather than the tail of `ready-page.ts` for the reason every
 * split here happens: that file is a page, with a heading, a button and a line
 * about whose turn it is, and this is one instrument on it.
 */

/** Half the distance between the two rings, from the page's centre. */
export const RING_GAP = 46;
export const RING_R = 22;

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  world: World,
  seat: 1 | 2,
  label: string,
  bright: boolean,
  r = RING_R,
): void {
  const fill = readyFraction(world, seat);
  const done = seatReady(world, seat);
  const holding = readyHeld(world, seat);

  ctx.textAlign = "center";
  if (label) {
    ctx.font = '600 8px "Courier New",monospace';
    ctx.fillStyle = bright ? PALETTE.shieldRim : PALETTE.dim;
    ctx.fillText(label, cx, cy - r - 8);
  }

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#3B3163";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  if (fill > 0) {
    ctx.strokeStyle = done ? PALETTE.good : bright ? PALETTE.hull : PALETTE.hullRim;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill);
    ctx.stroke();
  }
  // A held circle that is not full yet gets a filled centre, so a thumb that
  // is down reads at a glance and not only as an arc that happens to be moving.
  if (holding && !done) {
    ctx.fillStyle = "rgba(122,111,168,.30)";
    ctx.beginPath();
    ctx.arc(cx, cy, r - 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = '700 11px "Courier New",monospace';
  ctx.fillStyle = done ? PALETTE.good : PALETTE.dim;
  ctx.fillText(done ? "READY" : "", cx, cy + r + 15);
  ctx.textAlign = "left";
}
