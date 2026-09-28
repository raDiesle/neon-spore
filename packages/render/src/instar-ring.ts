import { circleSubpath } from "@neon-spore/content";
import type { InstarGesture } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { drawInstarCrosshair } from "./instar-crosshair.js";
import { drawInstarGlyph } from "./instar-glyphs.js";
import { drawMarkWait } from "./mark-feedback.js";
import { PALETTE, STROKE } from "./palette.js";

/** How far past its radius a ring breathes out: harder while its seat is awaited. */
export const RING_SWELL = { awaited: 0.14, calm: 0.08 } as const;

/**
 * The ring itself: red, brighter for the seat it wants, breathing until a
 * thumb lands, its arc filling as the part gives. A shoot mark's is a violet
 * crosshair instead, with nothing over the part (`instar-crosshair.ts`).
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
  const swell = awaited ? RING_SWELL.awaited : RING_SWELL.calm;
  const breathe = held ? 1 : 1 + swell * Math.sin(time * beat);
  const glow = (mine ? (held ? 1.4 : 1.3) : 0.4) * (awaited ? 1.35 : 1);
  if (gesture === "shoot") {
    // A crosshair and not a ring, and nothing over the part (`instar-crosshair.ts`).
    drawInstarCrosshair(ctx, x, y, r * breathe, held || awaited, glow);
    if (!mine) drawMarkWait(ctx, x, y, r, time);
    drawProgress(ctx, x, y, r, along);
    return;
  }
  const p = new Path2D(circleSubpath(x, y, r * breathe));
  ctx.save();
  ctx.fillStyle = PALETTE.background;
  ctx.fill(p);
  ctx.fillStyle = PALETTE.red;
  ctx.globalAlpha = held ? 0.5 + along * 0.4 : mine ? 0.22 : 0.1;
  ctx.fill(p);
  ctx.restore();
  strokeGlow(ctx, p, held || awaited ? PALETTE.redRim : PALETTE.red, STROKE.inner, glow);
  ctx.save();
  ctx.strokeStyle = ctx.fillStyle = mine ? PALETTE.text : PALETTE.dim;
  ctx.globalAlpha = mine ? 0.95 : 0.5;
  if (mine) drawInstarGlyph(ctx, gesture, x, y, r, time);
  ctx.restore();
  if (!mine) drawMarkWait(ctx, x, y, r, time);
  drawProgress(ctx, x, y, r, along);
}

/** The arc round the mark that fills as the part gives. */
function drawProgress(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  along: number,
): void {
  if (along <= 0) return;
  // Green: the part is giving, so the carry is going the right way — the
  // simulation holds a pull the wrong way at nought, so an arc at all is
  // already the answer to *am I doing it right* (`mark-feedback.ts`).
  ctx.save();
  ctx.strokeStyle = PALETTE.good;
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.beginPath();
  ctx.arc(x, y, r * 1.55, -Math.PI / 2, -Math.PI / 2 + Math.PI * 2 * along);
  ctx.stroke();
  ctx.restore();
}
