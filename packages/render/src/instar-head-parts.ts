import { strokeGlow } from "./glow.js";
import { drawGlint } from "./instar-hide.js";
import { drawHorn } from "./instar-horn.js";
import type { Point } from "./instar-place.js";
import { drawSeam, faded } from "./instar-plate.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The small parts of THE INSTAR's face**: the horns, the eyes, the fangs and
 * the sinew strung between the jaws. Split off `instar-head.ts` on 25
 * September 2026, when the head was given its hide (`instar-hide.ts`) and the
 * file reached its limit; the head says where the jaws are, and this draws
 * what grows on them.
 *
 * Each is drawn as a made thing: the horns ridged tubes of bone (`instar-horn.ts`),
 * the eyes in a wet socket with a glint on them, each fang with its shadowed
 * side away from the key.
 */

/** A place `x`, `y` head radii off `o`. */
export const r2 = (o: Point, r: number, x: number, y: number): Point => ({
  x: o.x + x * r,
  y: o.y + y * r,
});

/**
 * Two horns off each brow, swept back and out: tubes of bone going away from
 * the player (`instar-horn.ts`), so the lens draws their points in smaller
 * and the haze takes them toward the field. `turn` is the brow's idle turn.
 */
export function drawHorns(
  ctx: CanvasRenderingContext2D,
  up: Point,
  r: number,
  s: number,
  fade: number,
  turn = 0,
) {
  for (const [bx, by, cx, cy, tx, ty, w, back] of [
    [0.6, -0.6, 1.05, -0.85, 1.22, -1.42, 0.12, 1.1],
    [0.84, -0.36, 1.2, -0.45, 1.36, -0.78, 0.075, 0.7],
  ] as const) {
    const horn = {
      base: r2(up, r, s * bx, by),
      bend: r2(up, r, s * cx, cy),
      tip: r2(up, r, s * tx, ty),
      width: w * r,
      lean: -back * r,
    };
    drawHorn(ctx, horn, r, fade, turn);
  }
}

/** One of the front eyes' irises: `eye` is the lid's opening, `look` how far the slit has turned. */
export interface EyeIris {
  at: Point;
  r: number;
  open: number;
  look: number;
  fade: number;
  eye: Path2D;
}

/** How an iris is painted: the seam VERSUS offers a baked one through (`instar-eye-baked.ts`). */
export const IRIS_LOOK: { paint: (ctx: CanvasRenderingContext2D, iris: EyeIris) => void } = {
  paint: (ctx, { at, r, open, look, fade, eye }) => {
    ctx.fillStyle = faded(PALETTE.pod, fade, 0.95);
    ctx.fill(eye);
    // The iris burns hotter round the slit.
    ctx.fillStyle = faded(PALETTE.ember, fade, 0.55);
    ctx.beginPath();
    ctx.ellipse(at.x + look, at.y, r * 0.07, r * 0.07 * open, 0, 0, Math.PI * 2);
    ctx.fill();
  },
};

/** A slanted gold eye with a slit pupil, narrowed as `eye` goes to nought. */
export function drawEye(
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
  const tilt = -s * 0.35;
  // The socket: a wet hollow the eye sits in, open or shut.
  ctx.save();
  ctx.fillStyle = faded(PALETTE.background, fade, 0.75);
  ctx.beginPath();
  ctx.ellipse(at.x, at.y + r * 0.01, r * 0.22, r * 0.11, tilt, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  if (open <= 0.02) return;
  const p = new Path2D();
  p.ellipse(at.x, at.y, r * 0.17, r * 0.075 * open, tilt, 0, Math.PI * 2);
  const look = Math.sin(time * 0.6) * r * 0.04;
  ctx.save();
  IRIS_LOOK.paint(ctx, { at, r, open, look, fade, eye: p });
  ctx.fillStyle = faded(PALETTE.background, fade);
  ctx.beginPath();
  ctx.ellipse(at.x + look, at.y, r * 0.022, r * 0.068 * open, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
  strokeGlow(ctx, p, faded(PALETTE.podRim, fade), STROKE.inner, 0.7 * fade);
  drawGlint(ctx, { x: at.x - r * 0.05, y: at.y - r * 0.02 * open }, r * 0.022 * open, fade);
}

/** The strings of sinew between the two jaws, gone once they are near shut. */
export function drawSinews(
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
export function drawTeeth(
  ctx: CanvasRenderingContext2D,
  lip: Point,
  r: number,
  dir: 1 | -1,
  len: number,
  fade: number,
): void {
  ctx.save();
  const n = dir === 1 ? 7 : 6;
  const lit = new Path2D();
  const dark = new Path2D();
  for (let i = 0; i < n; i++) {
    const u = -0.52 + (1.04 * i) / (n - 1);
    const sag = dir * 0.1 * (1 - (u / 0.64) ** 2) - dir * 0.02;
    const x = lip.x + u * r;
    const y = lip.y + sag * r;
    const fang = i === 1 || i === n - 2 ? 1.9 : 1;
    const tip = y + dir * len * fang * r;
    // Each fang is two faces: the one toward the key lit, the far one in shade.
    lit.moveTo(x - r * 0.04, y);
    lit.lineTo(x, y);
    lit.lineTo(x, tip);
    lit.closePath();
    dark.moveTo(x, y);
    dark.lineTo(x + r * 0.04, y);
    dark.lineTo(x, tip);
    dark.closePath();
  }
  ctx.fillStyle = faded(PALETTE.rock, fade, 0.95);
  ctx.fill(lit);
  ctx.fillStyle = faded(PALETTE.rockDark, fade, 0.95);
  ctx.fill(dark);
  ctx.restore();
}
