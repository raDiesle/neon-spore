import { PALETTE, STROKE } from "./palette.js";

/**
 * **A lever's groove**, the one drawing THE LEVER LAB and the game's LEVER
 * share (`tools/director/src/lever-lab-paint.ts`, `blister-lever-help.ts`):
 * where the knob stands is the value, not only whether it got there, so the
 * groove is graduated and the zone it asks for lies on it.
 *
 * - **the groove the whole reach**, faint, since the channel over it is
 *   drawn only as far as the knob is asked to go;
 * - **the zone**: a wide band dim until the value is in it, then green;
 * - **a notch every quarter** of the reach;
 * - **the zone's edges drawn long**, the threshold the thumb carries past.
 *
 * Out of the lab's paint on 15 October 2026, when THE BLISTER took a LEVER
 * and the game needed the same marks: the lab draws it from here now.
 */

/** One side of a groove, from its rest (depth 0) to its end (depth 1). Straight. */
export interface GrooveSide {
  readonly x0: number;
  readonly y0: number;
  readonly x1: number;
  readonly y1: number;
}

export interface LeverGrooveDraw {
  /** Where on the groove the value must be, as depths 0..1; null asks nothing. */
  zone: readonly [number, number] | null;
  /** Whether the value is in the zone now. */
  lit: boolean;
  /** The screen's tile, which the groove's widths are shares of. */
  tile: number;
}

/** The groove, its quarter notches and its zone, on every side given. */
export function drawLeverGroove(
  ctx: CanvasRenderingContext2D,
  sides: readonly GrooveSide[],
  { zone, lit, tile }: LeverGrooveDraw,
): void {
  ctx.save();
  ctx.lineCap = "round";
  ctx.strokeStyle = PALETTE.dim;
  ctx.globalAlpha = 0.28;
  ctx.lineWidth = tile * 0.3;
  ctx.beginPath();
  for (const s of sides) span(ctx, s, 0, 1);
  ctx.stroke();
  if (zone) {
    ctx.strokeStyle = lit ? PALETTE.good : PALETTE.dim;
    ctx.globalAlpha = lit ? 0.32 : 0.2;
    ctx.lineWidth = tile * 0.9;
    ctx.beginPath();
    for (const s of sides) span(ctx, s, zone[0], zone[1]);
    ctx.stroke();
  }
  ctx.globalAlpha = 0.55;
  ctx.strokeStyle = PALETTE.dim;
  ctx.lineWidth = STROKE.inner;
  ctx.beginPath();
  for (const s of sides) for (const d of [0.25, 0.5, 0.75, 1]) notch(ctx, s, d, tile * 0.22);
  ctx.stroke();
  if (zone) {
    ctx.globalAlpha = 0.95;
    ctx.strokeStyle = lit ? PALETTE.good : PALETTE.text;
    ctx.lineWidth = STROKE.outline;
    ctx.beginPath();
    for (const s of sides) for (const d of zone) if (d < 1) notch(ctx, s, d, tile * 0.62);
    ctx.stroke();
  }
  ctx.restore();
}

/** A depth's point on a side. */
export function groovePoint(s: GrooveSide, depth: number): { x: number; y: number } {
  return { x: s.x0 + (s.x1 - s.x0) * depth, y: s.y0 + (s.y1 - s.y0) * depth };
}

function span(ctx: CanvasRenderingContext2D, s: GrooveSide, from: number, to: number): void {
  const a = groovePoint(s, from);
  const b = groovePoint(s, to);
  ctx.moveTo(a.x, a.y);
  ctx.lineTo(b.x, b.y);
}

/** Across the side at `depth`: a notch `half` long either side of it. */
function notch(ctx: CanvasRenderingContext2D, s: GrooveSide, depth: number, half: number): void {
  const q = groovePoint(s, depth);
  const len = Math.hypot(s.x1 - s.x0, s.y1 - s.y0) || 1;
  const dx = (s.x1 - s.x0) / len;
  const dy = (s.y1 - s.y0) / len;
  ctx.moveTo(q.x - dy * half, q.y + dx * half);
  ctx.lineTo(q.x + dy * half, q.y - dx * half);
}
