import { drawEarGlyph, drawSpeechGlyph } from "../../../../../packages/render/src/comms-glyphs.js";
import { BLOCK, TAU } from "../ink.js";

/** How far a dot hops, and how fast the three take turns. */
const HOP = 1.4;
const RATE = 7;

/**
 * **The three dots.** The talker's mark is the speech bubble with the three
 * dots inside it hopping in turn — the sign every messenger shows while
 * somebody is composing what they are about to say. The listener's is the ear
 * with three dots drifting into it one after another: what is said arriving.
 */
export function typingSpeak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  drawSpeechGlyph(ctx, x, y - 1, 6.4, ink, 1);
  ctx.save();
  ctx.fillStyle = BLOCK;
  ctx.beginPath();
  for (let i = 0; i < 3; i++) {
    const lift = HOP * Math.max(0, Math.sin(time * RATE - i * 0.9));
    const dx = x + (i - 1) * 3.2;
    ctx.moveTo(dx + 1, y - 1 - lift);
    ctx.arc(dx, y - 1 - lift, 1, 0, TAU);
  }
  ctx.fill();
  ctx.restore();
}

export function typingListen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const ex = x + 2.8;
  drawEarGlyph(ctx, ex, y, 4.2, ink, 0.95);
  ctx.save();
  ctx.fillStyle = ink;
  for (let i = 0; i < 3; i++) {
    // Each dot slides in from the left and fades as it reaches the ear.
    const t = (time * 1.4 + i / 3) % 1;
    ctx.globalAlpha = 0.9 * Math.sin(Math.PI * t);
    ctx.beginPath();
    ctx.arc(ex - 9 + t * 5, y, 0.9, 0, TAU);
    ctx.fill();
  }
  ctx.restore();
}
