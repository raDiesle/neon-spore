import { circleSubpath } from "@neon-spore/content";
import { arcFromTop } from "./arc-from-top.js";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **A held part is right, and how far the partner has got** — the owner, 7
 * October 2026, on THE CAPSTAN and for every on-screen event: *show that
 * position of pull is correct and that other player is still busy and … his
 * current process, so that he knows to keep pulling and holding.*
 *
 * Two pictures, both green because green is `good`'s reserved meaning
 * (`palette.ts`), beside the halo, the partner's ring and the clock of
 * `mark-feedback.ts`:
 *
 * - **A mark held where it is wanted wears a steady green ring** — not the
 *   verdict's flash, which widens and goes, but a ring that stays for as long
 *   as the thumb does: *this is right, keep it there*.
 * - **A mark being worked wears its progress as a green arc** round it, from
 *   twelve o'clock clockwise (`arc-from-top.ts`). Given `segments`, the arc is
 *   cut into that many — one a reversal, one a beat — over a dim track of all
 *   of them, so a pair can see from nought how many the part needs. Drawn on
 *   both screens: the working seat's count is the waiting seat's reason to
 *   keep holding.
 *
 * THE INSTAR's arc was the first of these (`instar-ring.ts`) and calls this.
 */

/** How far out THE INSTAR's progress arc runs, in mark radii; a mark with a
 * body of its own round it hugs that instead, and says how far itself. */
export const MARK_PROGRESS_R = 1.55;
/** The gap between two segments, as a share of one. */
const GAP = 0.18;

/**
 * A mark's progress on a ring of radius `R` round `x, y`, `share` of the way:
 * one green arc, or `segments` of them over a dim track of all. A plain arc
 * draws nothing at nought.
 */
export function drawMarkProgress(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  R: number,
  share: number,
  segments?: number,
): void {
  const along = Math.max(0, Math.min(1, share));
  ctx.save();
  ctx.lineWidth = STROKE.outline * 1.6;
  if (segments === undefined || segments < 2) {
    if (along <= 0) {
      ctx.restore();
      return;
    }
    ctx.strokeStyle = PALETTE.good;
    ctx.beginPath();
    arcFromTop(ctx, x, y, R, along);
    ctx.stroke();
    ctx.restore();
    return;
  }
  const done = Math.floor(along * segments + 1e-6);
  const step = (Math.PI * 2) / segments;
  // A dark bed under the track, so the dim segments read over a lit body.
  ctx.strokeStyle = rgba(PALETTE.background, 0.75);
  ctx.lineWidth = STROKE.outline * 2.6;
  ctx.stroke(new Path2D(circleSubpath(x, y, R)));
  ctx.lineWidth = STROKE.outline * 1.6;
  ctx.lineCap = "butt";
  for (let i = 0; i < segments; i++) {
    const a = -Math.PI / 2 + i * step + (step * GAP) / 2;
    ctx.strokeStyle = i < done ? PALETTE.good : rgba(PALETTE.text, 0.3);
    ctx.beginPath();
    ctx.arc(x, y, R, a, a + step * (1 - GAP));
    ctx.stroke();
  }
  ctx.restore();
}

/** Mark `x, y, r` held where it is wanted: a steady green ring just outside it, breathing a little. */
export function drawMarkHeld(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const breathe = 0.85 + 0.15 * Math.sin(time * 4);
  const ring = new Path2D(circleSubpath(x, y, r * 1.12));
  strokeGlow(ctx, ring, PALETTE.good, STROKE.outline * 1.4, breathe, 0.95);
}
