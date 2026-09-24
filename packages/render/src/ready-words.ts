import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";
import { hasSeatName, type SeatNames, seatName } from "./seat-name.js";

/**
 * **The words on the ready page**: what a circle is called, the question over
 * them, and the one line saying who is still reading.
 *
 * Its own file beside `ready-page.ts`, split when that one reached the
 * 250-line ceiling, along the seam it already had. Next door is the page's
 * *measure* — where the column's rows fall, given nothing but a layout, so a
 * circle does not move with the length of a wave's sentence — and everything
 * here is what is written in them. The measure is argued over in pixels; this
 * is argued over in sentences, and every line of it is an instruction the
 * owner gave about how much to say.
 *
 * `ASK_SUB` and `LABEL_GAP` come with the words because they are the words'
 * own heights — the drop to HOLD ANYWHERE and the gap a circle's name wants —
 * and the measure imports them back to leave room for what it cannot see.
 */

/** How far HOLD ANYWHERE sits under READY?, and the room a circle's own name
 * wants under it. */
export const ASK_SUB = 18;
export const LABEL_GAP = 20;

/**
 * What to call a circle. A name if the room knows one — these are two people
 * and the gate should say so — and otherwise YOU and THEM on a phone, which
 * says more than a number does, or the two numbers at a desk holding both.
 */
export function label(seat: 1 | 2, own: boolean, both: boolean, names?: SeatNames): string {
  if (hasSeatName(seat, names)) return seatName(seat, names);
  if (both) return seatName(seat);
  return own ? "YOU" : "THEM";
}

/** The question, pulsing, where a button used to be a thing to press. */
export function ask(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  done: boolean,
  beat: number,
): void {
  ctx.textAlign = "center";
  ctx.font = '700 30px "Courier New",monospace';
  if (done) {
    ctx.fillStyle = PALETTE.good;
    ctx.fillText("READY", l.width / 2, y);
  } else {
    ctx.globalAlpha = 0.55 + 0.45 * Math.abs(Math.sin(beat * 2.2));
    ctx.fillStyle = PALETTE.hullRim;
    ctx.fillText("READY?", l.width / 2, y);
    ctx.globalAlpha = 1;
    ctx.font = '11px "Courier New",monospace';
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText("HOLD ANYWHERE", l.width / 2, y + ASK_SUB);
  }
  ctx.textAlign = "left";
}

export interface WaitingState {
  mineReady: boolean;
  theirsReady: boolean;
  both: boolean;
  other: 1 | 2;
  beat: number;
  names?: SeatNames;
}

/**
 * Who is still reading, in the size that answer deserves — and in one line.
 *
 * It used to be a heading and a sentence under it in each case, and the owner
 * cut the page back: *shorten text to a minimum*. Nothing here was wrong and
 * all of it was a second way of saying the thing above it, on a screen whose
 * whole content is two circles and a question.
 */
export function waiting(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  y: number,
  s: WaitingState,
): void {
  const them = s.both ? "THE OTHER PLAYER" : seatName(s.other, s.names);
  ctx.textAlign = "center";
  if (s.mineReady && !s.theirsReady) {
    ctx.globalAlpha = 0.62 + 0.38 * Math.abs(Math.sin(s.beat * 2.2));
    ctx.font = '700 17px "Courier New",monospace';
    ctx.fillStyle = PALETTE.pod;
    ctx.fillText(`WAITING FOR ${them}`, l.width / 2, y);
    ctx.globalAlpha = 1;
  } else if (s.theirsReady && !s.mineReady) {
    ctx.font = '700 17px "Courier New",monospace';
    ctx.fillStyle = PALETTE.good;
    ctx.fillText(`${them} IS READY`, l.width / 2, y);
  }
  ctx.textAlign = "left";
}
