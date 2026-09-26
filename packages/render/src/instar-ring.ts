import { circleSubpath } from "@neon-spore/content";
import type { InstarGesture } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import { drawInstarWait } from "./instar-mark-feedback.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * The ring itself: red, brighter for the seat it wants, breathing until a
 * thumb lands, its arc filling as the part gives.
 *
 * `awaited` is the partner already answered and counting: the ring breathes
 * harder and burns brighter, because this is the mark the step is waiting on
 * and what happens if it does not come is the other one going back to nought
 * (`instar-together.ts`).
 */
export function drawInstarRing(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  gesture: InstarGesture,
  mine: boolean,
  held: boolean,
  along: number,
  time: number,
  awaited: boolean,
): void {
  const beat = awaited ? 7 : 4;
  const swell = awaited ? 0.14 : 0.08;
  const breathe = held ? 1 : 1 + swell * Math.sin(time * beat);
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = PALETTE.red;
  ctx.globalAlpha = held ? 0.5 + along * 0.4 : mine ? 0.22 : 0.1;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(
    ctx,
    p,
    held || awaited ? PALETTE.redRim : PALETTE.red,
    STROKE.inner,
    (mine ? (held ? 1.4 : 1.3) : 0.4) * (awaited ? 1.35 : 1),
  );
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.95 : 0.5;
  if (mine) drawInstarGlyph(ctx, gesture, x, y, r, time);
  ctx.restore();
  if (!mine) drawInstarWait(ctx, x, y, r, time);
  if (along <= 0) return;
  // Green: the part is giving, so the carry is going the right way — the
  // simulation holds a pull the wrong way at nought, so an arc at all is
  // already the answer to *am I doing it right* (`instar-mark-feedback.ts`).
  ctx.save();
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * along);
  ctx.stroke();
  ctx.restore();
}
