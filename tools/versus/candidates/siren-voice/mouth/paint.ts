import { drawEarGlyph } from "../../../../../packages/render/src/comms-glyphs.js";
import { BLOCK, soundArc, TAU } from "../ink.js";

/**
 * **A mouth that talks and an ear that pricks up.** The talker's mark is a
 * pair of lips opening and shutting on syllables — the fastest thing a face
 * does, and the one an eye catches first. The listener's is the ear leaning
 * in, with a single wave rising in front of it each time the mouth on the
 * other chip opens, so the two move on one clock.
 */
export function mouthSpeak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const open = mouthOpen(time);
  const w = 6;
  const top = y - 3.4;
  // An open mouth seen from the front: a flat upper lip and a jaw that drops
  // with every syllable — a D on its back. Not a lens: a lens with something
  // in it is the eye the strip already marks its blip with.
  ctx.save();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.moveTo(x - w, top);
  ctx.quadraticCurveTo(x, top + 1.2, x + w, top);
  // A quadratic reaches half its control's depth: 1.5 shut, 8.5 wide open.
  ctx.quadraticCurveTo(x, top + 3 + 14 * open, x - w, top);
  ctx.fill();
  // The tongue, in the block's own cream, once the jaw is down far enough.
  if (open > 0.35) {
    ctx.fillStyle = BLOCK;
    ctx.beginPath();
    ctx.ellipse(x, top + 1 + 5.4 * open, 2.8, 1.6 * open, 0, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}

export function mouthListen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const open = mouthOpen(time);
  const ex = x + 2;
  ctx.save();
  // The ear leans towards what it hears.
  ctx.translate(ex, y + 4);
  ctx.rotate(-0.22 * open);
  ctx.translate(-ex, -(y + 4));
  drawEarGlyph(ctx, ex, y, 4.6, ink, 0.95);
  ctx.restore();
  soundArc(ctx, ex, y, 6.5 + open, Math.PI, ink, 0.2 + 0.8 * open, 1.3);
}

/** How far the mouth is open, 0 to 1: syllables on a slower phrase. */
function mouthOpen(time: number): number {
  return 0.15 + 0.85 * Math.abs(Math.sin(time * 9)) * (0.55 + 0.45 * Math.sin(time * 2.3) ** 2);
}
