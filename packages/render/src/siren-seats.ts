import type { Seat } from "./comms.js";
import { drawEarGlyph, drawSpeechGlyph } from "./comms-glyphs.js";
import { halo } from "./glow.js";
import type { Layout } from "./layout.js";
import { PALETTE } from "./palette.js";

/**
 * The two chips that flank the siren: which seat, and what that seat has to do
 * about the thing on the field.
 *
 * Its own file beside `siren.ts` for the reason `veil-question.ts` sits beside
 * `veil-marks.ts`: next door is the *instrument* — a dial with rings and a
 * turning core, all of it phase off a clock — and this is the *answer*, which
 * has no motion in it worth speaking of and is entirely about legibility at
 * twenty pixels. They are argued about separately and they change separately.
 */

/** The chip's own box. Fixed pixels like the rest of the HUD. */
export const PILL_W = 34;
const PILL_H = 20;
/** The housing colour the label is knocked out of, shared with the dial. */
const CASE = "#0D1117";

/**
 * One seat's chip: its name and the job it has this frame.
 *
 * **The talker is a solid block and the listener is an outline**, and that is
 * the whole of the difference — not two brightnesses of the same shape. The
 * first version drew both as dim pills and separated them by alpha, which is a
 * distinction the eye has to *compare* to read: with one chip on screen there
 * is nothing to compare it against, and the answer to "am I the one talking"
 * arrives a beat late. Filled against unfilled is legible on its own, from a
 * glance, with no second chip to hold it up.
 *
 * **`mine` is a ring and not a brightness, and that took two tries.** Dimming
 * the partner's chip is the obvious way to say whose is whose, and it fights
 * the sentence above: on the navigator's screen the seat that has to talk is
 * the *other* one, so the chip carrying the whole message was the chip being
 * faded out. Both are now drawn at full strength and the local seat is circled
 * in the hull's own purple instead — the colour of the ship each player is
 * sitting in, used nowhere else up here. Talk versus listen is read off the
 * fill; you versus them is read off the ring; neither costs the other anything.
 */
export function drawSeat(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  seat: Seat,
  talks: boolean,
  cx: number,
  cy: number,
  time: number,
): void {
  // The test view is both halves on one screen, so neither chip is anybody's
  // "own" and neither is ringed — the same exemption `showsVeilCore` makes.
  const mine = l.role === seat;
  // Only a talker's chip breathes. A listener has nothing to time.
  const pulse = talks ? 0.84 + 0.16 * Math.sin(time * 6) : 1;
  const left = cx - PILL_W / 2;
  const top = cy - PILL_H / 2;
  const label = seat === "p1" ? "P1" : "P2";

  ctx.font = '700 9px "Courier New",monospace';
  ctx.textAlign = "left";
  ctx.textBaseline = "middle";

  if (talks) {
    // Light behind it first, so the block reads as lit rather than as painted.
    halo(ctx, cx, cy, PILL_W * 0.85, PALETTE.text, 0.2 * pulse);
    ctx.globalAlpha = pulse;
    ctx.fillStyle = PALETTE.text;
    ctx.beginPath();
    ctx.roundRect(left, top, PILL_W, PILL_H, 5);
    ctx.fill();
    // Knocked out of the block rather than drawn on it: dark on light is the
    // one contrast nothing else in this HUD uses.
    ctx.globalAlpha = 1;
    ctx.fillStyle = CASE;
    ctx.fillText(label, left + 4, cy + 0.5);
    drawSpeechGlyph(ctx, left + PILL_W - 9, cy - 0.5, 5.4, CASE, 1);
  } else {
    ctx.globalAlpha = 0.55;
    ctx.fillStyle = CASE;
    ctx.beginPath();
    ctx.roundRect(left, top, PILL_W, PILL_H, 5);
    ctx.fill();
    ctx.globalAlpha = 0.6;
    ctx.strokeStyle = PALETTE.dim;
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.roundRect(left + 0.5, top + 0.5, PILL_W - 1, PILL_H - 1, 5);
    ctx.stroke();
    ctx.globalAlpha = 0.9;
    ctx.fillStyle = PALETTE.dim;
    ctx.fillText(label, left + 4, cy + 0.5);
    drawEarGlyph(ctx, left + PILL_W - 9, cy, 5, PALETTE.dim, 0.95);
  }

  // The ring that says *this one is you*, outside the box either way.
  if (mine) {
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = PALETTE.hull;
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.roundRect(left - 2.5, top - 2.5, PILL_W + 5, PILL_H + 5, 7);
    ctx.stroke();
  }

  ctx.globalAlpha = 1;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";
}
