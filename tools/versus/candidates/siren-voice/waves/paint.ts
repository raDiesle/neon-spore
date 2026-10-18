import { drawEarGlyph } from "../../../../../packages/render/src/comms-glyphs.js";
import { soundArc, TAU, wave } from "../ink.js";

/** One sweep of the three arcs, in seconds. */
const SWEEP = 0.7;

/**
 * **Sound going out, sound coming in.** The talker's mark is a voice — a dot
 * with three arcs radiating from it, lit one after another outwards, the
 * loudspeaker sign every phone uses for *sound on*. The listener's is the ear
 * with the same three arcs arriving at it, lit one after another inwards: the
 * same picture run backwards, so the two chips are one sentence — *that one
 * says, this one hears*.
 */
export function wavesSpeak(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const ox = x - 5;
  ctx.save();
  ctx.fillStyle = ink;
  ctx.beginPath();
  ctx.arc(ox, y, 2.1, 0, TAU);
  ctx.fill();
  ctx.restore();
  for (let i = 0; i < 3; i++) {
    soundArc(ctx, ox, y, 3.2 + i * 2.3, 0, ink, 0.25 + 0.75 * wave(time, SWEEP, i / 3), 1.6);
  }
}

export function wavesListen(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  ink: string,
  time: number,
): void {
  const ex = x + 3;
  drawEarGlyph(ctx, ex, y, 4, ink, 0.95);
  for (let i = 0; i < 3; i++) {
    // Outermost first, so the light travels towards the ear.
    soundArc(
      ctx,
      ex,
      y,
      5 + (2 - i) * 1.9,
      Math.PI,
      ink,
      0.15 + 0.7 * wave(time, SWEEP, i / 3),
      1.2,
    );
  }
}
