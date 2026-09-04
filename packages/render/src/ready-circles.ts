import { readyFraction, readyHeld, seatReady, type World } from "@neon-spore/sim";
import { halo } from "./glow.js";
import { PALETTE } from "./palette.js";
import { seatSkin } from "./seat-skin.js";

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
 * **The circle is the control now**, not a gauge beside one. There was a button
 * under these that filled as it was held, and the owner's answer was that one
 * of the two had to go: *we don't need button and circle to have progress, only
 * stay with the circle.* So this is what a thumb presses, it is drawn big, and
 * the one waiting for its own player breathes — a ring of that seat's own
 * colour, widening and fading, which is the whole of "this wants something from
 * you" without a word being spent on it.
 *
 * Yours is the brighter of the two and named YOU, theirs is dimmed and named
 * THEM. In `test` — one person at a desk holding both seats — neither is
 * "yours", so they are named PLAYER ONE and PLAYER TWO and drawn alike.
 *
 * Its own file rather than the tail of `ready-page.ts` for the reason every
 * split here happens: that file is a page, with a heading, a question and a
 * line about whose turn it is, and this is one instrument on it.
 */

export const RING_R = 22;

export interface CircleMood {
  /** Whether this one is waiting on the person holding this screen. */
  calling?: boolean;
  /** Seconds, for the breathing. */
  beat?: number;
}

export function drawCircle(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  world: World,
  seat: 1 | 2,
  label: string,
  bright: boolean,
  r = RING_R,
  mood: CircleMood = {},
): void {
  const fill = readyFraction(world, seat);
  const done = seatReady(world, seat);
  const holding = readyHeld(world, seat);
  const skin = seatSkin(seat === 1 ? "p1" : "p2");
  const beat = mood.beat ?? 0;
  const line = Math.max(4, r * 0.16);

  // The call: a ring that swells and fades on the beat of the words above it.
  // Only ever on the circle whose thumb is missing (`ready-page.ts` decides).
  if (mood.calling && !holding) {
    const k = (Math.sin(beat * 2.2) + 1) / 2;
    halo(ctx, cx, cy, r * (1.5 + 0.5 * k), skin.tint, 0.16 + 0.14 * k);
    ctx.globalAlpha = 0.2 + 0.24 * (1 - k);
    ctx.strokeStyle = skin.tint;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(cx, cy, r + 6 + 10 * k, 0, Math.PI * 2);
    ctx.stroke();
    ctx.globalAlpha = 1;
  }
  if (done) halo(ctx, cx, cy, r * 2.1, PALETTE.good, 0.24);

  ctx.textAlign = "center";
  if (label) {
    ctx.font = `600 ${Math.max(8, Math.round(r * 0.24))}px "Courier New",monospace`;
    ctx.fillStyle = bright ? skin.rim : PALETTE.dim;
    ctx.fillText(label, cx, cy - r - 12);
  }

  ctx.lineWidth = line;
  ctx.strokeStyle = "#3B3163";
  ctx.beginPath();
  ctx.arc(cx, cy, r, 0, Math.PI * 2);
  ctx.stroke();

  if (fill > 0) {
    ctx.strokeStyle = done ? PALETTE.good : bright ? skin.tint : skin.rim;
    ctx.beginPath();
    ctx.arc(cx, cy, r, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * fill);
    ctx.stroke();
  }
  // A held circle that is not full yet gets a filled centre, so a thumb that
  // is down reads at a glance and not only as an arc that happens to be moving.
  if (holding && !done) {
    ctx.fillStyle = "rgba(122,111,168,.30)";
    ctx.beginPath();
    ctx.arc(cx, cy, r - line - 1, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.font = `700 ${Math.max(11, Math.round(r * 0.3))}px "Courier New",monospace`;
  ctx.fillStyle = done ? PALETTE.good : PALETTE.dim;
  ctx.fillText(done ? "READY" : "", cx, cy + r + Math.max(15, r * 0.42));
  ctx.textAlign = "left";
}
