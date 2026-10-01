import { strokeGlow } from "./glow.js";
import { drawGlint } from "./instar-hide.js";
import type { Point } from "./instar-place.js";
import { faded, type Look } from "./instar-plate.js";
import { drawWeak } from "./instar-weak.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The parts a head in profile shares**, whichever skull carries them: the
 * socket and the eye in it, and the teeth along the upper lip. Split off
 * `instar-side-head.ts` so a second profile can call them instead of
 * drawing its own.
 */

/** A jaw's turn on its hinge: a point in the jaw's rest pose, carried `open` radians down. */
export function hinged(hinge: Point, open: number): (p: Point) => Point {
  const cos = Math.cos(-open);
  const sin = Math.sin(-open);
  return (p) => {
    const dx = p.x - hinge.x;
    const dy = p.y - hinge.y;
    return { x: hinge.x + dx * cos - dy * sin, y: hinge.y + dx * sin + dy * cos };
  };
}

/** Teeth hanging off the upper lip at `roots`, each `lengths[i]` long and
 * two faces, the one toward the key lit. */
export function drawLipTeeth(
  ctx: CanvasRenderingContext2D,
  roots: readonly Point[],
  lengths: readonly number[],
  half: number,
  fade: number,
): void {
  ctx.save();
  roots.forEach((p, i) => {
    const tip = p.y + (lengths[i] ?? 0);
    for (const [s, hex] of [
      [-1, PALETTE.rock],
      [1, PALETTE.rockDark],
    ] as const) {
      ctx.fillStyle = faded(hex, fade, 0.95);
      ctx.beginPath();
      ctx.moveTo(p.x + s * half, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p.x, tip);
      ctx.closePath();
      ctx.fill();
    }
  });
  ctx.restore();
}

/** The socket at `eye`, and the eye in it while it is open: the slit ember
 * iris, its rim, the weak point's glow and the glint. */
export function drawSideEye(ctx: CanvasRenderingContext2D, look: Look, eye: Point): void {
  const { f, r, fade } = look;
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade, 0.75);
  ctx.beginPath();
  ctx.ellipse(eye.x, eye.y + r * 0.01, r * 0.2, r * 0.1, 0.25, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (f.eye <= 0.02) return;
  const p = new Path2D();
  p.ellipse(eye.x, eye.y, r * 0.15, r * 0.065 * f.eye, 0.25, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.pod, fade, 0.95);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.ember, fade, 0.55);
  ctx.beginPath();
  ctx.ellipse(eye.x - r * 0.03, eye.y, r * 0.065, r * 0.06 * f.eye, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.beginPath();
  ctx.ellipse(eye.x - r * 0.03, eye.y, r * 0.02, r * 0.06 * f.eye, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.podRim, fade), STROKE.inner, 0.7 * fade);
  drawWeak(ctx, p, (look.weak?.eye ?? 0) * fade, "eye");
  drawGlint(ctx, { x: eye.x - r * 0.06, y: eye.y - r * 0.015 * f.eye }, r * 0.02 * f.eye, fade);
}
