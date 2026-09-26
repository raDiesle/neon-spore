import type { InstarGesture } from "@neon-spore/sim";
import { STROKE } from "./palette.js";

/**
 * **The gesture, drawn inside the ring** — one glyph per member of
 * `INSTAR_GESTURES`, so a mark says what it wants before the word over it
 * is read: an arrow down or up for the pulls, a ring of dots for the tap,
 * three chevrons for the swipe, a hooked arc for the turn — running
 * anticlockwise for `turnBack` — two thumbs for the hold. Each is drawn in the caller's stroke colour at the ring's
 * centre, `r` the ring's radius, `time` for the ones that move.
 *
 * Its own file because `instar-marks.ts` owns the ring, the window and the
 * word and was at its limit with those.
 */
export function drawInstarGlyph(
  ctx: CanvasRenderingContext2D,
  gesture: InstarGesture,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  ctx.save();
  ctx.lineWidth = STROKE.outline;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  if (gesture === "pullDown" || gesture === "pullUp")
    arrow(ctx, x, y, r, gesture === "pullDown" ? 1 : -1, time);
  else if (gesture === "tap") tap(ctx, x, y, r, time);
  else if (gesture === "swipeDown") chevrons(ctx, x, y, r, time);
  else if (gesture === "turn") turn(ctx, x, y, r, time, 1);
  else if (gesture === "turnBack") turn(ctx, x, y, r, time, -1);
  else hold(ctx, x, y, r);
  ctx.restore();
}

/** A shaft with a head, sliding a little in its own direction. */
function arrow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  dir: 1 | -1,
  time: number,
): void {
  const slide = dir * r * 0.12 * Math.sin(time * 5);
  const top = y - dir * r * 0.5 + slide;
  const tip = y + dir * r * 0.5 + slide;
  ctx.beginPath();
  ctx.moveTo(x, top);
  ctx.lineTo(x, tip);
  ctx.moveTo(x - r * 0.3, tip - dir * r * 0.3);
  ctx.lineTo(x, tip);
  ctx.lineTo(x + r * 0.3, tip - dir * r * 0.3);
  ctx.stroke();
}

/** A dot with rings flaring out of it, the way a tap lands. */
function tap(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, time: number): void {
  ctx.beginPath();
  ctx.arc(x, y, r * 0.16, 0, Math.PI * 2);
  ctx.fill();
  const phase = (time * 1.5) % 1;
  ctx.beginPath();
  ctx.arc(x, y, r * (0.25 + 0.4 * phase), 0, Math.PI * 2);
  ctx.globalAlpha *= 1 - phase;
  ctx.stroke();
}

/** Three chevrons, running down. */
function chevrons(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
): void {
  const run = ((time * 2) % 1) * r * 0.3;
  for (let i = -1; i <= 1; i++) {
    const cy = y + i * r * 0.32 + run - r * 0.15;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.3, cy - r * 0.15);
    ctx.lineTo(x, cy + r * 0.05);
    ctx.lineTo(x + r * 0.3, cy - r * 0.15);
    ctx.stroke();
  }
}

/** Three quarters of a circle with a head on its end, turning clockwise. */
function turn(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  r: number,
  time: number,
  way: 1 | -1,
): void {
  // `way` is 1 clockwise, -1 anticlockwise: the arc spins the way it winds.
  const a0 = way * ((time * 2) % (Math.PI * 2));
  const a1 = a0 + way * Math.PI * 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r * 0.45, a0, a1, way < 0);
  ctx.stroke();
  const hx = x + Math.cos(a1) * r * 0.45;
  const hy = y + Math.sin(a1) * r * 0.45;
  // The head points along the arc's direction of travel: the tangent at a1.
  const tx = -way * Math.sin(a1);
  const ty = way * Math.cos(a1);
  ctx.beginPath();
  ctx.moveTo(hx - tx * r * 0.22 - ty * r * 0.18, hy - ty * r * 0.22 + tx * r * 0.18);
  ctx.lineTo(hx, hy);
  ctx.lineTo(hx - tx * r * 0.22 + ty * r * 0.18, hy - ty * r * 0.22 - tx * r * 0.18);
  ctx.stroke();
}

/** Two thumbprints side by side: both, and kept down. */
function hold(ctx: CanvasRenderingContext2D, x: number, y: number, r: number): void {
  for (const side of [-1, 1]) {
    ctx.beginPath();
    ctx.ellipse(x + side * r * 0.28, y, r * 0.16, r * 0.24, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
