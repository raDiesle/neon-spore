import { strokeGlow, strokeGlowFaded } from "./glow.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The mark a rub asks with: a red line, and an arrow coming in at it from
 * each side**, the same on every boss. The owner, 3 October 2026, on THE
 * GRINDSTONE (since retired): *remove scanner rectangle box and instead have the middle line
 * to rub to be a very visible red colour. then two arrows from each side
 * animating to move in the middle to make clear the rub directions come from
 * the horizontal left and right. the rub is a reusable on screen control
 * concept.*
 *
 * So a `RUB` cue wears this in place of the scan frame (`cue-helper.ts`),
 * HOLD's way (`hold-mark.ts`): the line is the place being rubbed, in the red
 * of every mark asking this seat, and the two arrows slide in to it from left
 * and right over and over — the stroke the thumb makes, drawn as motion
 * rather than said. The thumb may rub along any axis (`rub-turns.ts`); this is
 * the one the field shows.
 */

/** How far out an arrow starts, and where it stops short of the line, in the line's half-length. */
const ARROW_FROM = 1.5;
const ARROW_TO = 0.35;
/** An arrowhead's reach and half-height, in the same. */
const HEAD_LEN = 0.22;
const HEAD_HALF = 0.26;
/** Strokes a second: one arrow in from each side, together. */
const STROKES_PER_S = 1.6;

/**
 * Where the two arrows' tips stand at `time`, left then right, and how
 * strongly they show: in from far out to just short of the line, fading up as
 * they leave and out as they arrive, so the loop back is never seen.
 */
export function rubArrows(
  x: number,
  half: number,
  time: number,
): { tips: readonly [number, number]; alpha: number } {
  const t = (((time * STROKES_PER_S) % 1) + 1) % 1;
  const at = (ARROW_FROM + (ARROW_TO - ARROW_FROM) * t) * half;
  return { tips: [x - at, x + at], alpha: Math.sin(t * Math.PI) };
}

export function drawRubMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  /** Half the line's length: the face being rubbed, top to middle. */
  half: number,
  time: number,
): void {
  const breath = (Math.sin(time * 4.4) + 1) / 2;
  const line = new Path2D();
  line.moveTo(x, y - half);
  line.lineTo(x, y + half);
  ctx.save();
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  strokeGlow(ctx, line, PALETTE.red, STROKE.outline * 2.4, 0.85 + 0.15 * breath);
  strokeGlow(ctx, line, PALETTE.redRim, STROKE.outline * 0.9, 0.6);
  const { tips, alpha } = rubArrows(x, half, time);
  ctx.globalAlpha = alpha;
  for (const tip of tips) {
    const sense = tip < x ? -1 : 1;
    const back = tip + sense * HEAD_LEN * half;
    const head = new Path2D();
    head.moveTo(back, y - HEAD_HALF * half);
    head.lineTo(tip, y);
    head.lineTo(back, y + HEAD_HALF * half);
    head.moveTo(tip, y);
    head.lineTo(tip + sense * HEAD_LEN * 2.2 * half, y);
    strokeGlowFaded(ctx, head, PALETTE.red, STROKE.outline * 1.6, 0.9);
  }
  ctx.restore();
}
