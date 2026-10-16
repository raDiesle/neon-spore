import { type GlanceFrame, glanceSqueeze, middleShift, turnOf } from "./glance.js";
import { halfRect, type Reach } from "./glance-layer-box.js";
import { rgba } from "./hex.js";
import { SHADOW } from "./solid-tube-light.js";

/**
 * **A glancing part's two halves and its far side's dark**, as
 * `glance-layer.ts` lays one part down and `glance-batch.ts` lays a frame's
 * worth: the turn and clip each half is drawn under, and the gradient that
 * darkens the far one.
 */

/**
 * Half `s`'s turn and clip on `c`, over whatever transform `c` already has;
 * saved first. A part that nods is turned seen along its turn (`turnOf`): its
 * halves are split square to it and squeezed along it, then seen back, so
 * `c` is left in the part's own frame either way.
 */
export function enterHalf(
  c: CanvasRenderingContext2D,
  f: GlanceFrame,
  s: -1 | 1,
  reach: Reach,
): void {
  const { x, y } = f;
  const { angle, along } = turnOf(f);
  const k = glanceSqueeze(along, s);
  c.save();
  c.translate(x, y);
  c.rotate(f.roll + angle);
  c.translate(-x, -y);
  c.transform(k, 0, 0, 1, x + middleShift(along) - k * x, 0);
  c.beginPath();
  c.rect(...halfRect(f, s, reach));
  c.clip();
  if (angle === 0) return;
  // Seen back: the transform `squeeze ∘ rotate(-angle)` the content is drawn under.
  c.translate(x, y);
  c.rotate(-angle);
  c.translate(-x, -y);
}

/**
 * The far half's dark on `c`, under the turn and clip `enterHalf` gives it, in
 * the blend `blend` sets, over what `paint` fills.
 */
export function farDark(
  c: CanvasRenderingContext2D,
  f: GlanceFrame,
  far: -1 | 1,
  reach: Reach,
  ramp: { dark: number; span: number },
  blend: (c: CanvasRenderingContext2D) => void,
  paint: (c: CanvasRenderingContext2D) => void,
): void {
  enterHalf(c, f, far, reach);
  blend(c);
  // Along the turn: across, for a part that does not nod, exactly as it always was.
  const { angle } = turnOf(f);
  const run = far * ramp.span * f.r;
  const grad =
    angle === 0
      ? c.createLinearGradient(f.x, 0, f.x + run, 0)
      : c.createLinearGradient(f.x, f.y, f.x + run * Math.cos(angle), f.y + run * Math.sin(angle));
  grad.addColorStop(0, rgba(SHADOW, 0));
  grad.addColorStop(1, rgba(SHADOW, ramp.dark));
  c.fillStyle = grad;
  paint(c);
  c.restore();
}

/**
 * A rectangle the far half's clip lies within in the part's own frame: the
 * half itself, or, seen back from along a nod, the whole turned square.
 */
export function wholeRect(f: GlanceFrame, reach: Reach, angle: number) {
  if (angle === 0) return halfRect(f, f.swing > 0 ? 1 : -1, reach);
  const w = Math.SQRT2 * reach.side;
  return [f.x - w, f.y - w, 2 * w, 2 * w] as const;
}
