import { readyFraction, readyHeld, seatReady, type World } from "@neon-spore/sim";
import type { Layout, ViewRole } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The ready gate a guide ends on: two circles, filling, and the wave waits
 * until both say READY. `sim/briefing.ts` owns every rule of it — this only
 * reads how full each one is.
 *
 * **Both circles are on both screens**, and that is the whole reason it is a
 * two-player gesture rather than two solo ones: you can see your partner is
 * still reading, or that they finished a while ago and are waiting on you. A
 * screen that drew only its own circle would be the same feature with the
 * meaning taken out.
 *
 * **They are indicators, never buttons.** The press target is the whole
 * screen, the way the guide's own dismissal always was — shrinking it to the
 * drawn ring would be a regression dressed as precision.
 *
 * Yours is the brighter of the two and named YOU, theirs is dimmed and named
 * THEM. In `test` — one person at a desk holding both seats — neither is
 * "yours", so they are named PLAYER ONE and PLAYER TWO and drawn alike.
 *
 * Its own file rather than the tail of `briefing.ts` for the reason every
 * split here happens: that file is the guide's words and this is a gauge, and
 * the two only shared a file for as long as the second one was two pips.
 */

/** Room a guide has to leave under itself for the circles, their names and READY. */
export const READY_FOOT_H = 96;
/** Half the distance between the two rings, from the panel's centre. */
const RING_GAP = 46;
const RING_R = 22;

export function drawReadyGate(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  world: World,
  role: ViewRole,
  x: number,
  bottom: number,
  panelW: number,
): void {
  const both = role === "test";
  const mine: 1 | 2 | 0 = role === "p1" ? 1 : role === "p2" ? 2 : 0;
  const cy = bottom - READY_FOOT_H + 42;
  const cx = x + panelW / 2;

  for (const seat of [1, 2] as const) {
    const own = seat === mine;
    const label = both ? (seat === 1 ? "PLAYER ONE" : "PLAYER TWO") : own ? "YOU" : "THEM";
    drawCircle(ctx, cx + (seat === 1 ? -RING_GAP : RING_GAP), cy, world, seat, label, own || both);
  }

  const mineReady =
    mine === 0 ? seatReady(world, 1) && seatReady(world, 2) : seatReady(world, mine);
  ctx.textAlign = "center";
  ctx.font = '600 10px "Courier New",monospace';
  ctx.fillStyle = mineReady ? PALETTE.dim : PALETTE.hullRim;
  ctx.fillText(mineReady ? "WAITING FOR THEM" : "HOLD ANYWHERE WHEN READ", cx, bottom - 10);
  // Nothing else on the stage means anything right now; say so under the guide.
  ctx.font = '9px "Courier New",monospace';
  ctx.fillStyle = PALETTE.dim;
  ctx.fillText("read your half out loud", l.width / 2, bottom + 18);
  ctx.textAlign = "left";
}

/**
 * One seat's circle: a dim track, an arc for the fill, its name above and
 * READY under it once it is full. The arc starts at the top and runs
 * clockwise, which is the direction every loading indicator has ever gone —
 * this is not the moment to be interesting about it.
 */
function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  world: World,
  seat: 1 | 2,
  label: string,
  bright: boolean,
): void {
  const fill = readyFraction(world, seat);
  const done = seatReady(world, seat);
  const holding = readyHeld(world, seat);

  ctx.textAlign = "center";
  ctx.font = '600 8px "Courier New",monospace';
  ctx.fillStyle = bright ? PALETTE.shieldRim : PALETTE.dim;
  ctx.fillText(label, cx, cy - RING_R - 8);

  ctx.lineWidth = 4;
  ctx.strokeStyle = "#3B3163";
  ctx.beginPath();
  ctx.arc(cx, cy, RING_R, 0, Math.PI * 2);
  ctx.stroke();

  if (fill > 0) {
    ctx.strokeStyle = done ? PALETTE.good : bright ? PALETTE.hull : PALETTE.hullRim;
    ctx.beginPath();
    ctx.arc(cx, cy, RING_R, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill);
    ctx.stroke();
  }
  // A held circle that is not full yet gets a filled centre, so a thumb that
  // is down reads at a glance and not only as an arc that happens to be moving.
  if (holding && !done) {
    ctx.fillStyle = "rgba(122,111,168,.30)";
    ctx.beginPath();
    ctx.arc(cx, cy, RING_R - 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = '600 9px "Courier New",monospace';
  ctx.fillStyle = done ? PALETTE.good : PALETTE.dim;
  ctx.fillText(done ? "READY" : "", cx, cy + RING_R + 14);
  ctx.textAlign = "left";
}
