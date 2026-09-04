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
 * **The name is under the circle and it is big.** It used to sit above in nine
 * point, inside the reach of the ring that breathes around a circle waiting for
 * its thumb — *move "player 1" and "player 2" below the button, make it bigger,
 * and it should not overlay the animation of the buttons.* So the ring has the
 * space above and around it, the name has the space below it, and the word that
 * says this seat is done is inside the circle where nothing else is.
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

  // Inside the circle, where the ring cannot reach it.
  if (done) {
    ctx.font = `700 ${Math.max(10, Math.round(r * 0.26))}px "Courier New",monospace`;
    ctx.fillStyle = PALETTE.good;
    ctx.fillText("READY", cx, cy + r * 0.09);
  }
  // Under it, clear of the breathing ring, in the size a name deserves.
  if (label) {
    ctx.font = `700 ${Math.max(13, Math.round(r * 0.34))}px "Courier New",monospace`;
    ctx.fillStyle = bright ? skin.rim : PALETTE.dim;
    ctx.fillText(label, cx, cy + r + Math.max(28, r * 0.66));
  }
  ctx.textAlign = "left";
}
