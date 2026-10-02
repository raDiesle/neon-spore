import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The mark a hold asks with: a red circle with a thumbprint in it**, the
 * same on every boss. The owner, 2 October 2026, on THE OCULUS and in
 * general: *hold gesture indicator must be improved, is there no standard
 * visual we have already? i expect some red circle like, no scan rectangle
 * box. maybe as a symbol a thumb fingerprint in the middle.*
 *
 * So a `HOLD` cue wears this in place of the scan frame (`boss-cue-draw.ts`,
 * `cue-helper.ts`): the red of every mark asking this seat
 * (`mark-feedback.ts`), drawn as a ring that can be seen from across a table,
 * and the print of the thumb that goes on it — the one picture of *keep your
 * thumb here* that needs no word. The ring breathes with the cue's word; the
 * print stands still, as a thumb pressed down does.
 */

/** The ring's radius, in the cue frame's shorter half-extent. */
export const HOLD_MARK_R = 0.9;

/** The print's ridges, outermost first: their half-widths in the ring's radius. */
const RIDGES = [0.56, 0.44, 0.32, 0.2] as const;

export function drawHoldMark(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const breath = (Math.sin(time * 4.4) + 1) / 2;
  const ring = new Path2D();
  ring.arc(x, y, r, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.red, 0.16 + 0.12 * breath);
  ctx.fill(ring);
  strokeGlow(ctx, ring, PALETTE.red, STROKE.outline * 1.6, 0.7 + 0.3 * breath);
  drawThumbprint(ctx, x, y, r);
  ctx.restore();
}

/**
 * A thumbprint: ridges nested round a small loop, each a little taller than
 * wide and each broken once, the breaks stepping round so the print reads as
 * a whorl and not as a target.
 */
export function drawThumbprint(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
): void {
  ctx.save();
  ctx.strokeStyle = rgba(PALETTE.text, 0.92);
  ctx.lineWidth = Math.max(1, r * 0.07);
  ctx.lineCap = "round";
  RIDGES.forEach((w, i) => {
    // Each ridge leaves out a sixth of itself, the gap turned a little further each ring in.
    const gap = Math.PI / 3;
    const from = Math.PI / 2 + 0.9 * i + gap / 2;
    ctx.beginPath();
    ctx.ellipse(x, y + r * 0.04 * i, r * w, r * w * 1.25, 0, from, from + Math.PI * 2 - gap);
    ctx.stroke();
  });
  // The loop at the middle: a short hooked stroke.
  ctx.beginPath();
  ctx.ellipse(x, y + r * 0.14, r * 0.08, r * 0.12, 0, Math.PI, Math.PI * 2.6);
  ctx.stroke();
  ctx.restore();
}
