import type { Point } from "../../../../../packages/content/src/index.js";
import { noteMark } from "../../../../../packages/render/src/mark-spots.js";
import { PALETTE, STROKE } from "../../../../../packages/render/src/palette.js";
import type { PullKnobDraw } from "../../../../../packages/render/src/pull-knob.js";
import { drawWayArrow } from "../../../../../packages/render/src/way-arrow.js";
import { blob, countedFor, POP, REFUSE_BURST } from "./goo.js";

/**
 * OOZE's drop: SLIME's goo ball, under the hand wherever the hand has it.
 *
 * - **Waiting**, it calls for a thumb louder than any knob in the game:
 *   ripples run out of it, two at a time, over a breathing halo.
 * - **Counted**, it swells for a blink and pops, and is gone — the green
 *   place it went to (`ends.ts`) is what is left.
 * - **Refused**, it is red where it was let go, shudders, and is hauled home.
 */
export function oozeKnob(
  ctx: CanvasRenderingContext2D,
  on: Point,
  r: number,
  o: PullKnobDraw,
): void {
  const off = o.after?.off ?? { x: 0, y: 0 };
  const refused = o.after?.verdict === "refused" ? o.after.since : null;
  const shake = refused !== null ? Math.max(0, 1 - refused / REFUSE_BURST) : 0;
  const at = {
    x: on.x + off.x + Math.sin((refused ?? 0) * 70) * r * 0.22 * shake,
    y: on.y + off.y,
  };
  noteMark(ctx, at.x, at.y, r);
  const counted = countedFor(o.after, o.held);
  if (counted !== null && counted >= POP) return;
  ctx.save();
  if (!o.held && !o.theirs && !o.after?.verdict) call(ctx, at, r, o);
  // Counted: a swell, then gone.
  const pop =
    counted === null ? 1 : counted < POP * 0.35 ? 1.18 : 1 - (counted - POP * 0.35) / (POP * 0.65);
  const rr = r * Math.max(0, pop);
  const lean = o.way && !o.either ? { x: o.way.dx, y: o.way.dy } : { x: 0, y: 0 };
  const amt = o.held ? 0.08 : 0.12 + 0.1 * Math.max(0, Math.sin(o.time * 3));
  const body = ctx.createRadialGradient(
    at.x - rr * 0.3,
    at.y - rr * 0.35,
    rr * 0.1,
    at.x,
    at.y,
    rr * 1.1,
  );
  body.addColorStop(0, o.held || counted !== null ? PALETTE.text : o.rim);
  body.addColorStop(0.5, o.hex);
  body.addColorStop(1, o.held ? o.hex : PALETTE.background);
  ctx.globalAlpha = o.theirs ? 0.4 : 0.95;
  ctx.fillStyle = body;
  blob(ctx, at, rr, o.time, lean, amt);
  ctx.fill();
  ctx.strokeStyle = o.held ? PALETTE.text : o.rim;
  ctx.lineWidth = STROKE.outline;
  ctx.stroke();
  ctx.fillStyle = PALETTE.text;
  ctx.globalAlpha = 0.55;
  ctx.beginPath();
  ctx.ellipse(at.x - rr * 0.35, at.y - rr * 0.45, rr * 0.22, rr * 0.12, -0.6, 0, Math.PI * 2);
  ctx.fill();
  if (o.way && counted === null && refused === null) {
    ctx.globalAlpha = 0.9;
    ctx.strokeStyle = PALETTE.background;
    ctx.lineWidth = STROKE.outline * 1.5;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    drawWayArrow(ctx, at.x, at.y, r * 1.1, o.way.dx, o.way.dy, o.time, o.either ? 2 : 1);
  }
  ctx.restore();
}

/** Put a thumb here: a breathing halo, and ripples running out of the drop two at a time. */
function call(ctx: CanvasRenderingContext2D, at: Point, r: number, o: PullKnobDraw): void {
  const breathe = 0.5 + 0.5 * Math.sin(o.time * 4);
  const halo = ctx.createRadialGradient(at.x, at.y, r * 0.8, at.x, at.y, r * 2.3);
  halo.addColorStop(0, o.hex);
  halo.addColorStop(1, "rgba(0,0,0,0)");
  ctx.fillStyle = halo;
  ctx.globalAlpha = 0.25 + 0.25 * breathe;
  ctx.beginPath();
  ctx.arc(at.x, at.y, r * 2.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = o.rim;
  for (const lag of [0, 0.5]) {
    const u = (o.time * 0.85 + lag) % 1;
    ctx.globalAlpha = 0.85 * (1 - u);
    ctx.lineWidth = STROKE.outline * 1.8 * (1 - u) + 0.3;
    blob(ctx, at, r * (1.15 + 1.25 * u), o.time);
    ctx.stroke();
  }
}
