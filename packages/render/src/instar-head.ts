import { strokeGlow } from "./glow.js";
import { drawFireball } from "./instar-fire.js";
import { drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import type { Point } from "./instar-shape.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **THE INSTAR's head, face-on**: a dragon's, the jaws wide at the ship.
 *
 * The upper jaw is the whole top of the head — snout, nostrils, the two slit
 * eyes under their brows, the horns swept back off it — and the lower jaw is
 * the chin; between them the mouth, dark, strung with sinew, fanged on both
 * lips, the fire turning in the middle of it (`instar-fire.ts`). The owner
 * asked for it on 25 September 2026: *the enemy already has open mouth to
 * spit out fire like a dragon*.
 *
 * **The two lips are the two marks.** Wide open they stand the script's
 * distance apart, the upper at 220 and the lower at 500, and each moves back
 * to the bite by as much as its thumb has pushed it (`instar-shape.ts`,
 * `deformed`): the whole upper head comes down, the chin comes up, and the
 * fire has less room between them.
 */

/** How far each lip stands off the middle of the mouth, in head radii: shut and wide. */
const LIP_SHUT = 0.08;
const LIP_OPEN = 0.75;

const r2 = (o: Point, r: number, x: number, y: number): Point => ({
  x: o.x + x * r,
  y: o.y + y * r,
});

/** The upper jaw and brow, from the lip up, in head radii. */
const UPPER: readonly (readonly [number, number])[] = [
  [-0.64, 0.02],
  [-0.35, 0.09],
  [0, 0.11],
  [0.35, 0.09],
  [0.64, 0.02],
  [0.9, -0.3],
  [0.8, -0.62],
  [0.42, -0.74],
  [0, -0.56],
  [-0.42, -0.74],
  [-0.8, -0.62],
  [-0.9, -0.3],
];

/** The lower jaw, from the lip down to the chin. */
const LOWER: readonly (readonly [number, number])[] = [
  [-0.62, -0.02],
  [0, -0.07],
  [0.62, -0.02],
  [0.72, 0.22],
  [0.42, 0.54],
  [0, 0.64],
  [-0.42, 0.54],
  [-0.72, 0.22],
];

export function drawFrontHead(ctx: CanvasRenderingContext2D, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  const up = { x: head.x, y: head.y - r * (LIP_SHUT + LIP_OPEN * f.jawUp) };
  const down = { x: head.x, y: head.y + r * (LIP_SHUT + LIP_OPEN * f.jawDown) };
  const gap = (down.y - up.y) / r;
  for (const s of [-1, 1]) drawHorns(ctx, up, r, s, fade);
  const chin = new Path2D();
  LOWER.forEach(([x, y], i) => {
    const p = r2(down, r, x, y);
    if (i === 0) chin.moveTo(p.x, p.y);
    else chin.lineTo(p.x, p.y);
  });
  chin.closePath();
  drawPlate(ctx, chin, fade, 0.6, hurt);
  drawSeam(ctx, r2(down, r, -0.4, 0.3), r2(down, r, 0, 0.42), r2(down, r, 0.4, 0.3), fade);
  // The mouth, lip to lip, and the throat lit by the fire in it.
  const mouth = new Path2D();
  const a = r2(up, r, -0.64, 0.02);
  mouth.moveTo(a.x, a.y);
  const q = (c: Point, e: Point) => mouth.quadraticCurveTo(c.x, c.y, e.x, e.y);
  q(r2(up, r, 0, 0.18), r2(up, r, 0.64, 0.02));
  q({ x: head.x + r * 0.84, y: (up.y + down.y) / 2 }, r2(down, r, 0.62, -0.02));
  q(r2(down, r, 0, -0.14), r2(down, r, -0.62, -0.02));
  q({ x: head.x - r * 0.84, y: (up.y + down.y) / 2 }, a);
  mouth.closePath();
  const fire = look.fire * Math.min(1, Math.max(0, (gap - 0.25) / 0.6));
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade, 0.97);
  ctx.fill(mouth);
  if (fire > 0) {
    ctx.fillStyle = faded(PALETTE.ember, fade, 0.22 * fire);
    ctx.fill(mouth);
  }
  ctx.restore();
  strokeGlow(ctx, mouth, faded(PALETTE.hullRim, fade), STROKE.inner, 0.5 * fade);
  const middle = (up.y + down.y) / 2;
  const ball = Math.min(r * (0.12 + 0.42 * fire), ((down.y - up.y) / 2) * 0.8);
  if (fire > 0) drawFireball(ctx, head.x, middle, ball, time, fade);
  drawSinews(ctx, up, down, r, gap, fade);
  drawTeeth(ctx, up, r, 1, 0.1 + 0.08 * f.jawUp, fade);
  drawTeeth(ctx, down, r, -1, 0.08 + 0.07 * f.jawDown, fade);
  const skull = new Path2D();
  UPPER.forEach(([x, y], i) => {
    const p = r2(up, r, x, y);
    if (i === 0) skull.moveTo(p.x, p.y);
    else skull.lineTo(p.x, p.y);
  });
  skull.closePath();
  drawPlate(ctx, skull, fade, 0.7, hurt);
  drawSeam(ctx, r2(up, r, 0, -0.54), r2(up, r, 0.03, -0.3), r2(up, r, 0, -0.08), fade, 0.6);
  // The nostrils, smoking with the fire behind them.
  ctx.save();
  for (const s of [-1, 1]) {
    const n = r2(up, r, s * 0.14, -0.1);
    ctx.fillStyle = faded(PALETTE.background, fade);
    ctx.beginPath();
    ctx.ellipse(n.x, n.y, r * 0.05, r * 0.025, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = faded(PALETTE.ember, fade, 0.3 + 0.6 * look.fire);
    ctx.beginPath();
    ctx.ellipse(n.x, n.y, r * 0.025, r * 0.012, s * 0.5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.restore();
  for (const s of [-1, 1]) drawEye(ctx, r2(up, r, s * 0.48, -0.44), r, s, f.eye, time, fade);
}

/** Two horns off each brow, swept back and out. */
function drawHorns(ctx: CanvasRenderingContext2D, up: Point, r: number, s: number, fade: number) {
  for (const [bx, by, cx, cy, tx, ty, w] of [
    [0.6, -0.64, 1.05, -0.85, 1.22, -1.42, 0.13],
    [0.84, -0.4, 1.2, -0.45, 1.36, -0.78, 0.08],
  ] as const) {
    const base = r2(up, r, s * bx, by);
    const tip = r2(up, r, s * tx, ty);
    const p = new Path2D();
    p.moveTo(base.x - s * w * r, base.y);
    p.quadraticCurveTo(up.x + s * (cx - w) * r, up.y + cy * r, tip.x, tip.y);
    p.quadraticCurveTo(up.x + s * (cx + w) * r, up.y + (cy + w) * r, base.x + s * w * r, base.y);
    p.closePath();
    ctx.save();
    ctx.fillStyle = faded(PALETTE.rockDark, fade);
    ctx.fill(p);
    ctx.restore();
    strokeGlow(ctx, p, faded(PALETTE.rock, fade), STROKE.inner, 0.3 * fade);
  }
}

/** A slanted gold eye with a slit pupil, narrowed as `eye` goes to nought. */
function drawEye(
  ctx: CanvasRenderingContext2D,
  at: Point,
  r: number,
  s: number,
  open: number,
  time: number,
  fade: number,
): void {
  drawSeam(
    ctx,
    r2(at, r, -0.2, -0.12 + s * 0.05),
    r2(at, r, 0, -0.2),
    r2(at, r, 0.2, -0.12 - s * 0.05),
    fade,
    0.7,
  );
  if (open <= 0.02) return;
  const tilt = -s * 0.35;
  const p = new Path2D();
  p.ellipse(at.x, at.y, r * 0.17, r * 0.075 * open, tilt, 0, Math.PI * 2);
  ctx.save();
  ctx.fillStyle = faded(PALETTE.pod, fade, 0.95);
  ctx.fill(p);
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.beginPath();
  const look = Math.sin(time * 0.6) * r * 0.04;
  ctx.ellipse(at.x + look, at.y, r * 0.022, r * 0.068 * open, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.podRim, fade), STROKE.inner, 0.7 * fade);
}

/** The strings of sinew between the two jaws, gone once they are near shut. */
function drawSinews(
  ctx: CanvasRenderingContext2D,
  up: Point,
  down: Point,
  r: number,
  gap: number,
  fade: number,
): void {
  if (gap < 0.4) return;
  ctx.save();
  ctx.strokeStyle = faded(PALETTE.hullRim, fade, 0.3);
  ctx.lineWidth = STROKE.inner;
  for (const x of [-0.56, -0.42, 0.44, 0.58]) {
    ctx.beginPath();
    ctx.moveTo(up.x + x * r, up.y + 0.04 * r);
    ctx.quadraticCurveTo(
      up.x + x * 1.08 * r,
      (up.y + down.y) / 2,
      down.x + x * r,
      down.y - 0.04 * r,
    );
    ctx.stroke();
  }
  ctx.restore();
}

/** A row of fangs on one lip, `dir` 1 hanging down and -1 standing up; the
 * two outermost are the long ones. */
function drawTeeth(
  ctx: CanvasRenderingContext2D,
  lip: Point,
  r: number,
  dir: 1 | -1,
  len: number,
  fade: number,
): void {
  ctx.save();
  ctx.fillStyle = faded(PALETTE.rock, fade, 0.95);
  const n = dir === 1 ? 7 : 6;
  for (let i = 0; i < n; i++) {
    const u = -0.52 + (1.04 * i) / (n - 1);
    const sag = dir * 0.1 * (1 - (u / 0.64) ** 2) - dir * 0.02;
    const x = lip.x + u * r;
    const y = lip.y + sag * r;
    const fang = i === 1 || i === n - 2 ? 1.9 : 1;
    ctx.beginPath();
    ctx.moveTo(x - r * 0.04, y);
    ctx.lineTo(x + r * 0.04, y);
    ctx.lineTo(x, y + dir * len * fang * r);
    ctx.closePath();
    ctx.fill();
  }
  ctx.restore();
}
