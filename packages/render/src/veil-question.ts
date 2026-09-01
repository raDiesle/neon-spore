import type { CreatureKind } from "@neon-spore/sim";
import { PALETTE } from "./palette.js";

/**
 * Player 2's whole half of THE VEIL: a question mark, in the field over the
 * cloud and on the strip over the blip.
 *
 * Its own file beside `veil-marks.ts` because the two seats are two pictures
 * and only one of them is a *clock*. Next door is the pilot's — a ring that
 * drains and a switch mark in the colour it is running out into, all of it
 * arithmetic off `veilBeatsToMorph`. This is the seat that is told nothing,
 * and the mark it gets has no state at all. Keeping them apart is what stops
 * a change to the pilot's countdown reaching a screen that must never carry
 * one.
 */

/** The off-white the mark is drawn in — the HUD's own, not the lure's
 * absence-of-a-palette white. */
const MARK = PALETTE.text;

/**
 * Player 2's question mark, drawn as a hook and a dot rather than typed. The
 * same argument `veil-marks.ts` makes for its switch mark, and the one
 * `lure-alarm.ts` makes about its exclamation: at the size a body draws on a phone, a `?` in
 * nine-point type is three grey pixels.
 */
export function drawQuestion(
  ctx: CanvasRenderingContext2D,
  tile: number,
  x: number,
  y: number,
): void {
  const s = tile * 0.2;
  ctx.save();
  ctx.strokeStyle = MARK;
  ctx.fillStyle = MARK;
  ctx.lineWidth = Math.max(1.6, tile * 0.055);
  ctx.lineCap = "round";
  ctx.globalAlpha = 0.92;

  // The hook: three quarters of a circle, opening at the bottom left, then
  // down into the stem.
  ctx.beginPath();
  ctx.arc(x, y - s * 0.45, s * 0.52, Math.PI * 0.9, Math.PI * 0.35, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + s * 0.36, y - s * 0.1);
  ctx.lineTo(x, y + s * 0.42);
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(x, y + s * 0.9, s * 0.16, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * The strip's half of the same thing: a veil is announced as a **question
 * mark**, never as a colour.
 *
 * `drawRadar` reads `q.color` off the queue entry to tint every blip, and a
 * veil's queue entry carries none — the body inside is rolled when it enters
 * the field, so there is nothing there to read and the ordinary fallback would
 * have painted it cyan. That would be worse than a leak: it would be a
 * confident announcement of a colour that is right half the time.
 *
 * docs/spec/systems.md 5.2 asked for exactly this shape — *"the veil appears on
 * the radar as a question mark"* — in the same paragraph that lists the veil
 * among the rows that were not built.
 */
export function drawRadarVeilMark(
  ctx: CanvasRenderingContext2D,
  kind: CreatureKind,
  x: number,
  y: number,
  alpha: number,
): void {
  if (kind !== "veil") return;
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.strokeStyle = MARK;
  ctx.fillStyle = MARK;
  ctx.lineWidth = 1.6;
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.arc(x, y - 2.4, 3, Math.PI * 0.9, Math.PI * 0.35, false);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x + 2.1, y);
  ctx.lineTo(x, y + 2.6);
  ctx.stroke();
  ctx.beginPath();
  ctx.arc(x, y + 5, 1.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}
