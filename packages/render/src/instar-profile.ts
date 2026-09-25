import { halo, strokeGlow } from "./glow.js";
import { drawNests } from "./instar-eggs.js";
import { drawLamp, drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import { instarAt, instarFarEnd, type Point } from "./instar-shape.js";
import { drawTail } from "./instar-tail.js";
import { drawWing } from "./instar-wings.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE INSTAR side-on**: the perspective the owner asked to change to on 25
 * September 2026 — *the perspective has changed so we see him from the side*.
 * Head to the left, the long plated body across the field, the back up with
 * the two nests on it (`instar-eggs.ts`), the near wing raised off the back
 * and the far one behind it, the engines at the rear, the tail out behind or
 * curled over at the ship (`instar-tail.ts`).
 *
 * **The back runs through the nests.** The spine is a spline from the neck,
 * under each nest, to the rear, so wherever a pose puts its nests the eggs
 * sit on the body and not beside it (`instar-poses.ts`).
 */

/** Samples along the spine. */
const N = 16;

export function drawProfile(ctx: CanvasRenderingContext2D, l: Layout, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const rear = instarFarEnd(l, f);
  const nest = instarAt(l, f.nestX, f.nestY);
  const eggs = instarAt(l, f.eggsX, f.eggsY);
  const knots = [
    { x: head.x + r * 0.7, y: head.y + r * 0.15 },
    { x: nest.x, y: nest.y + r * 0.42 },
    { x: eggs.x, y: eggs.y + r * 0.42 },
    rear,
  ];
  const spine = Array.from({ length: N + 1 }, (_, i) => along(knots, i / N));
  const top: Point[] = [];
  const bottom: Point[] = [];
  spine.forEach((p, i) => {
    const u = i / N;
    const q = spine[Math.min(N, i + 1)] ?? p;
    const o = spine[Math.max(0, i - 1)] ?? p;
    const len = Math.hypot(q.x - o.x, q.y - o.y) || 1;
    const nx = (q.y - o.y) / len;
    const ny = -(q.x - o.x) / len;
    const w = r * (0.34 + 0.2 * Math.sin(Math.PI * Math.min(1, u * 1.3))) * (1 - 0.5 * u);
    top.push({ x: p.x + nx * w, y: p.y + ny * w });
    bottom.push({ x: p.x - nx * w * 0.9, y: p.y - ny * w * 0.9 });
  });
  const back = (u: number): Point => top[Math.round(u * N)] ?? rear;
  const wingAt = { ex: { x: 0, y: r * 0.8 }, ey: { x: r * 0.8, y: 0 } };
  drawWing(
    ctx,
    look,
    { x: back(0.38).x - r * 0.25, y: back(0.38).y - r * 0.1 },
    back(0.62),
    wingAt,
    1,
  );
  const flick = 0.75 + 0.25 * Math.sin(time * 21);
  halo(
    ctx,
    rear.x + r * 0.1,
    rear.y,
    Math.max(4, Math.round((r * 0.4) / 4) * 4),
    PALETTE.ember,
    0.7 * flick * fade,
  );
  const hide = splinePath([...top, ...bottom.reverse()], true);
  drawPlate(ctx, hide, fade, 0.5, hurt);
  bottom.reverse();
  for (let i = 2; i < N - 1; i += 2) {
    const a = top[i] as Point;
    const b = bottom[i] as Point;
    drawSeam(ctx, a, { x: (a.x + b.x) / 2 + r * 0.12, y: (a.y + b.y) / 2 }, b, fade, 0.35);
    const pulse = 0.6 + 0.4 * Math.sin(time * 2.4 - i * 0.5);
    drawLamp(
      ctx,
      { x: a.x * 0.35 + b.x * 0.65, y: a.y * 0.35 + b.y * 0.65 },
      r * 0.035,
      fade,
      pulse,
    );
  }
  drawTail(ctx, l, look, rear);
  drawWing(ctx, look, back(0.42), back(0.7), wingAt);
  drawNests(ctx, l, look);
  drawSideHead(ctx, look);
}

/** A point `u` of the way along a Catmull-Rom spline through `k`. */
function along(k: readonly Point[], u: number): Point {
  const n = k.length - 1;
  const s = Math.min(n - 1e-6, u * n);
  const i = Math.floor(s);
  const t = s - i;
  const p0 = k[Math.max(0, i - 1)] as Point;
  const p1 = k[i] as Point;
  const p2 = k[i + 1] as Point;
  const p3 = k[Math.min(n, i + 2)] as Point;
  const c = (a: number, b: number, c2: number, d: number) =>
    0.5 *
    (2 * b +
      (-a + c2) * t +
      (2 * a - 5 * b + 4 * c2 - d) * t * t +
      (-a + 3 * b - 3 * c2 + d) * t * t * t);
  return { x: c(p0.x, p1.x, p2.x, p3.x), y: c(p0.y, p1.y, p2.y, p3.y) };
}

/** The head in profile, snout to the left: the skull and its horns, the eye,
 * the lower jaw hinged open under it. */
function drawSideHead(ctx: CanvasRenderingContext2D, look: Look): void {
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
  drawPlate(ctx, lower, fade, 0.6, hurt);
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
  drawPlate(ctx, skull, fade, 0.7, hurt);
  // Teeth along the upper lip, over the open mouth.
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rock, fade, 0.95);
  for (let i = 0; i < 5; i++) {
    const p = at(-0.95 + i * 0.25, 0.06);
    ctx.beginPath();
    ctx.moveTo(p.x - r * 0.035, p.y);
    ctx.lineTo(p.x + r * 0.035, p.y);
    ctx.lineTo(p.x, p.y + r * (i === 1 ? 0.2 : 0.11));
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
  drawSeam(ctx, at(-0.9, -0.16), at(-0.4, -0.3), at(0.1, -0.42), fade, 0.5);
  drawLamp(ctx, at(-1.02, -0.06), r * 0.03, fade, 0.5 + 0.5 * Math.sin(time * 3));
  if (f.eye <= 0.02) return;
  const eye = at(-0.12, -0.27);
  const p = new Path2D();
  p.ellipse(eye.x, eye.y, r * 0.15, r * 0.065 * f.eye, 0.25, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.pod, fade, 0.95);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.beginPath();
  ctx.ellipse(eye.x - r * 0.03, eye.y, r * 0.02, r * 0.06 * f.eye, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.podRim, fade), STROKE.inner, 0.7 * fade);
}
