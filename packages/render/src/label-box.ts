import { PALETTE } from "./palette.js";

/**
 * The box a guide writes in: a solid ground, a two-pixel edge in the pod's
 * colour, sixteen-point Courier, centred.
 *
 * It is a caption's box (`guide-caption.ts`), and it was only a caption's
 * until the welcome page needed labels beside the bar's three buttons
 * (`guide-welcome.ts`). One recipe rather than two that drift: the owner
 * asked for a caption to be *louder* once already — bigger type, a solid
 * ground, a coloured edge — and a label that explains the caption's own bar
 * has to be the same object the caption is, or a reader meets two kinds of
 * writing on one screen and wonders which is the game's.
 */

/** One line's height, the type it is set in, and the ground round it. */
export const LABEL_LINE = 21;
export const LABEL_FONT = '700 16px "Courier New",monospace';
export const LABEL_PAD = 13;

export interface LabelBox {
  x: number;
  y: number;
  w: number;
  h: number;
}

/** How big a box these lines need, at `LABEL_FONT`. Sets the font. */
export function labelSize(
  ctx: CanvasRenderingContext2D,
  lines: readonly string[],
): { w: number; h: number } {
  ctx.font = LABEL_FONT;
  let w = 0;
  for (const line of lines) w = Math.max(w, ctx.measureText(line).width);
  return { w: w + LABEL_PAD * 2, h: lines.length * LABEL_LINE + 12 };
}

/** The ground and the edge, at whatever `globalAlpha` the caller has set. */
export function drawLabelGround(ctx: CanvasRenderingContext2D, b: LabelBox): void {
  ctx.fillStyle = "rgba(9,7,20,.96)";
  ctx.fillRect(b.x, b.y, b.w, b.h);
  ctx.strokeStyle = PALETTE.pod;
  ctx.lineWidth = 2;
  ctx.strokeRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2);
}

/** The lines, centred in the box, in the text colour. */
export function drawLabelLines(
  ctx: CanvasRenderingContext2D,
  b: LabelBox,
  lines: readonly string[],
): void {
  ctx.fillStyle = PALETTE.text;
  ctx.textAlign = "center";
  ctx.font = LABEL_FONT;
  lines.forEach((line, i) => {
    ctx.fillText(line, b.x + b.w / 2, b.y + 22 + i * LABEL_LINE);
  });
  ctx.textAlign = "left";
}
