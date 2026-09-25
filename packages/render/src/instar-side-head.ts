import { strokeGlow } from "./glow.js";
import { drawDrip, drawGlint, drawScales } from "./instar-hide.js";
import { drawLamp, drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import type { Point } from "./instar-shape.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR's head side-on**, snout to the left: the skull and its horns,
 * the socket and the eye in it, the lower jaw hinged open under it with the
 * venom hanging off its lip. Split off `instar-profile.ts`, which lays the
 * body out behind it.
 */

/** The head in profile, snout to the left: the skull and its horns, the eye,
 * the lower jaw hinged open under it. */
export function drawSideHead(ctx: CanvasRenderingContext2D, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const at = (x: number, y: number): Point => ({ x: head.x + x * r, y: head.y + y * r });
  const hinge = at(0.3, 0.08);
  const open = (0.15 + 0.55 * (f.jawUp + f.jawDown) * 0.5) * 0.8;
  const cos = Math.cos(-open);
  const sin = Math.sin(-open);
  const jaw = (x: number, y: number): Point => {
    const p = at(x, y);
    const dx = p.x - hinge.x;
    const dy = p.y - hinge.y;
    return { x: hinge.x + dx * cos - dy * sin, y: hinge.y + dx * sin + dy * cos };
  };
  const lower = splinePath(
    [
      jaw(0.3, 0.08),
      jaw(-0.3, 0.1),
      jaw(-0.95, 0.12),
      jaw(-0.9, 0.24),
      jaw(-0.3, 0.32),
      jaw(0.45, 0.3),
    ],
    true,
  );
  const mouth = new Path2D();
  for (const [i, p] of [at(0.3, 0.08), at(-1.1, 0.05), jaw(-0.95, 0.12), hinge].entries()) {
    if (i === 0) mouth.moveTo(p.x, p.y);
    else mouth.lineTo(p.x, p.y);
  }
  mouth.closePath();
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.fill(mouth);
  ctx.fillStyle = faded(PALETTE.ember, fade, 0.25);
  ctx.fill(mouth);
  ctx.restore();
  const chin = at(-0.3, 0.2);
  const tilt = -open * 0.6;
  drawPlate(ctx, lower, fade, 0.6, hurt, {
    x: chin.x,
    y: chin.y,
    r: r * 0.7,
    ry: r * 0.14,
    angle: tilt,
  });
  drawScales(
    ctx,
    lower,
    { x: chin.x, y: chin.y, r: r * 0.7, ry: r * 0.14, angle: tilt },
    r * 0.1,
    fade,
  );
  const lip = jaw(-0.9, 0.2);
  drawDrip(ctx, lip, r * 0.3, r * 0.03, time, 1, fade);
  drawDrip(ctx, jaw(-0.4, 0.3), r * 0.2, r * 0.025, time, 4, fade);
  for (const [bx, by, tx, ty] of [
    [0.4, -0.42, 1.3, -0.98],
    [0.15, -0.5, 0.75, -1.08],
  ] as const) {
    const horn = new Path2D();
    const b = at(bx, by);
    horn.moveTo(b.x - r * 0.1, b.y);
    horn.quadraticCurveTo(
      at(bx + 0.5, by - 0.2).x,
      at(bx + 0.5, by - 0.2).y,
      at(tx, ty).x,
      at(tx, ty).y,
    );
    horn.quadraticCurveTo(
      at(bx + 0.45, by + 0.05).x,
      at(bx + 0.45, by + 0.05).y,
      b.x + r * 0.12,
      b.y + r * 0.05,
    );
    horn.closePath();
    ctx.save();
    ctx.fillStyle = faded(PALETTE.rockDark, fade);
    ctx.fill(horn);
    const tip = at(tx, ty);
    const g = ctx.createLinearGradient(b.x, b.y, tip.x, tip.y);
    g.addColorStop(0, faded(PALETTE.rock, fade, 0));
    g.addColorStop(1, faded(PALETTE.rock, fade, 0.55));
    ctx.fillStyle = g;
    ctx.fill(horn);
    ctx.restore();
    strokeGlow(ctx, horn, faded(PALETTE.rock, fade), STROKE.inner, 0.3 * fade);
  }
  const skull = splinePath(
    [
      at(0.62, -0.38),
      at(0.15, -0.56),
      at(-0.3, -0.4),
      at(-0.8, -0.24),
      at(-1.15, -0.08),
      at(-1.1, 0.05),
      at(-0.4, 0.08),
      at(0.35, 0.1),
      at(0.78, 0.02),
    ],
    true,
  );
  const brow = at(-0.2, -0.2);
  const crown = { x: brow.x, y: brow.y, r: r * 0.95, ry: r * 0.3, angle: -0.2 };
  drawPlate(ctx, skull, fade, 0.7, hurt, crown);
  drawScales(ctx, skull, crown, r * 0.11, fade);
  // Teeth along the upper lip, over the open mouth.
  // Each tooth two faces, the one toward the key lit.
  ctx.save();
  for (let i = 0; i < 5; i++) {
    const p = at(-0.95 + i * 0.25, 0.06);
    const tip = p.y + r * (i === 1 ? 0.2 : 0.11);
    for (const [s, hex] of [
      [-1, PALETTE.rock],
      [1, PALETTE.rockDark],
    ] as const) {
      ctx.fillStyle = faded(hex, fade, 0.95);
      ctx.beginPath();
      ctx.moveTo(p.x + s * r * 0.035, p.y);
      ctx.lineTo(p.x, p.y);
      ctx.lineTo(p.x, tip);
      ctx.closePath();
      ctx.fill();
    }
  }
  ctx.restore();
  drawSeam(ctx, at(-0.9, -0.16), at(-0.4, -0.3), at(0.1, -0.42), fade, 0.5);
  drawLamp(ctx, at(-1.02, -0.06), r * 0.03, fade, 0.5 + 0.5 * Math.sin(time * 3));
  const eye = at(-0.12, -0.27);
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
  drawGlint(ctx, { x: eye.x - r * 0.06, y: eye.y - r * 0.015 * f.eye }, r * 0.02 * f.eye, fade);
}
