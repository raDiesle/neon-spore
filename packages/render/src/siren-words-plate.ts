import { PALETTE } from "./palette.js";
import { P1_SKIN, P2_SKIN } from "./seat-skin.js";

/**
 * The plate a siren word sits on: a word on a dark case, which is what keeps
 * it readable over a bright sky and over a body passing behind it, at the
 * smallest box that does — and the colour that says whose it is. Taken from
 * VERSUS with `siren-words.ts` (`siren:words` / `under`, 18 October 2026).
 */

/** A size up from the shipped line's 8 px, and white rather than violet-grey:
 * the owner asked for the words to be *good readable*. */
export const WORD_FONT = '700 10px "Courier New",monospace';
/** The plate's height, and the air either side of the word inside it. */
export const PLATE_H = 14;
/** Between a chip's bottom and the plate's top. */
export const PLATE_DROP = 3;
const PAD_X = 5;
const CASE = "#0D1117";

/** Each seat's own colour — the hull it sits in (`seat-skin.ts`). */
export function seatTint(seat: "p1" | "p2"): string {
  return seat === "p1" ? P1_SKIN.tint : P2_SKIN.tint;
}

/** Whether this seat is the one holding this phone; `test` holds both. */
export function isMine(role: string, seat: "p1" | "p2"): boolean {
  return role === "test" || role === seat;
}

/** How wide a plate is for this word. */
export function plateWidth(ctx: CanvasRenderingContext2D, word: string): number {
  ctx.font = WORD_FONT;
  return Math.ceil(ctx.measureText(word).width) + PAD_X * 2;
}

/**
 * One plate, its middle at (x, y): the case, an edge in `edge`, and the word.
 * `mine` is the word bright and the edge lit; the partner's is drawn quieter,
 * there to be read when looked for and not before.
 */
export function drawPlate(
  ctx: CanvasRenderingContext2D,
  word: string,
  x: number,
  y: number,
  edge: string,
  mine: boolean,
): void {
  const w = plateWidth(ctx, word);
  const left = x - w / 2;
  const top = y - PLATE_H / 2;
  ctx.save();
  ctx.globalAlpha = mine ? 0.86 : 0.7;
  ctx.fillStyle = CASE;
  ctx.beginPath();
  ctx.roundRect(left, top, w, PLATE_H, 4);
  ctx.fill();
  ctx.globalAlpha = mine ? 0.95 : 0.45;
  ctx.strokeStyle = edge;
  ctx.lineWidth = 1.2;
  ctx.stroke();
  ctx.globalAlpha = mine ? 1 : 0.7;
  ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.font = WORD_FONT;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(word, x, y + 0.5);
  ctx.restore();
}

/** `x` pulled in so a plate `w` wide stays `margin` inside the screen. */
export function keepOn(x: number, w: number, width: number, margin: number): number {
  return Math.min(Math.max(x, margin + w / 2), width - margin - w / 2);
}
