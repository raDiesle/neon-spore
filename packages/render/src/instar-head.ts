import { strokeGlow } from "./glow.js";
import { drawFireball } from "./instar-fire.js";
import { drawEye, drawHorns, drawSinews, drawTeeth, r2 } from "./instar-head-parts.js";
import { drawDrip, drawScales } from "./instar-hide.js";
import type { Point } from "./instar-place.js";
import { drawPlate, drawSeam, faded, type Look } from "./instar-plate.js";
import type { Figure } from "./instar-shape.js";
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
 *
 * **A shoved lip trembles** (`instar-shove.ts`): on the beat the jaw pushes
 * back against a thumb, that lip jumps outward and quivers as it settles,
 * twice as far at the third bite's push as at the second's — the owner's
 * *player really feels when pulling it is required to be stronger*. Only the
 * drawing trembles; the marks stay where the thumbs are.
 */

/** How far each lip stands off the middle of the mouth, in head radii: shut and wide. */
const LIP_SHUT = 0.08;
const LIP_OPEN = 0.75;

/**
 * The jaw's and brow's own idle wobble on `Form.angle`, same reasoning as the
 * body's `BODY_WOBBLE` (`instar-profile.ts`), the skull's `CROWN_WOBBLE`
 * (`instar-side-head.ts`) and the tail's `TAIL_WOBBLE` (`instar-tail.ts`,
 * `docs/style-guide.md`'s "Depth on a body that already ships"): neither
 * `Form` here ever sets an `angle` at all, so `lightHide` has always shaded
 * them at a bare `0` (`instar-hide.ts`, `form.angle ?? 0`) — the same still
 * life as an unmoving `atan2`, just with no motion to begin with. Two
 * different periods, neither shared with a period already used elsewhere, so
 * the jaw and the brow do not slide together.
 */
const JAW_WOBBLE = 0.05;
const JAW_WOBBLE_PERIOD = 4.7;
const BROW_WOBBLE = 0.05;
const BROW_WOBBLE_PERIOD = 8.6;

/** How far a lip shoved at full strength jumps outward, in head radii, and how fast it quivers. */
const TREMBLE = 0.09;
const TREMBLE_HZ = 13;

/** A lip's outward offset under a shove of strength `k`, in pixels: most of
 * it a jump open, the rest a quiver; `phase` so the two lips are not in step. */
function tremble(k: number, time: number, r: number, phase: number): number {
  if (k <= 0) return 0;
  return k * r * TREMBLE * (0.6 + 0.4 * Math.sin(time * Math.PI * 2 * TREMBLE_HZ + phase));
}

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

/** The upper lip's middle, which the whole top of the head hangs off. */
function upperLip(f: Figure, head: Point, r: number): Point {
  return { x: head.x, y: head.y - r * (LIP_SHUT + LIP_OPEN * f.jawUp) };
}

/** Where the face-on head draws an eye, `s` -1 for the left and 1 for the
 * right — the place a mark on the eye has to sit (`instar-script.ts`). */
export function frontEyeAt(f: Figure, head: Point, r: number, s: -1 | 1): Point {
  return r2(upperLip(f, head, r), r, s * 0.48, -0.44);
}

export function drawFrontHead(ctx: CanvasRenderingContext2D, look: Look): void {
  const { f, head, r, fade, hurt, time } = look;
  // The whole top of the head hangs off the upper lip, so a shove on it moves
  // the skull and the eyes with it.
  const top = { x: head.x, y: head.y - tremble(look.shoveUp, time, r, 0) };
  const up = upperLip(f, top, r);
  const down = {
    x: head.x,
    y: head.y + r * (LIP_SHUT + LIP_OPEN * f.jawDown) + tremble(look.shoveDown, time, r, 1.7),
  };
  const gap = (down.y - up.y) / r;
  for (const s of [-1, 1]) drawHorns(ctx, up, r, s, fade);
  const chin = new Path2D();
  LOWER.forEach(([x, y], i) => {
    const p = r2(down, r, x, y);
    if (i === 0) chin.moveTo(p.x, p.y);
    else chin.lineTo(p.x, p.y);
  });
  chin.closePath();
  const jawWobble = JAW_WOBBLE * Math.sin((time * (Math.PI * 2)) / JAW_WOBBLE_PERIOD);
  const jaw = {
    x: down.x,
    y: down.y + r * 0.28,
    r: r * 0.72,
    ry: r * 0.36,
    angle: jawWobble,
  };
  drawPlate(ctx, chin, fade, 0.6, hurt, jaw);
  drawScales(ctx, chin, jaw, r * 0.11, fade);
  // Slime off the chin, stretching and giving back.
  for (const [x, y, k] of [
    [-0.3, 0.5, 1],
    [0.22, 0.56, 2],
  ] as const)
    drawDrip(ctx, r2(down, r, x, y), r * 0.3, r * 0.028, time, k, fade);
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
  // Spit off the long fangs, while the mouth is open far enough to hang in.
  if (gap > 0.6)
    for (const s of [-1, 1])
      drawDrip(
        ctx,
        r2(up, r, s * 0.35, 0.22),
        r * 0.22,
        r * 0.018,
        time,
        3 + s,
        fade,
        PALETTE.emberRim,
      );
  const skull = new Path2D();
  UPPER.forEach(([x, y], i) => {
    const p = r2(up, r, x, y);
    if (i === 0) skull.moveTo(p.x, p.y);
    else skull.lineTo(p.x, p.y);
  });
  skull.closePath();
  const browWobble = BROW_WOBBLE * Math.sin((time * (Math.PI * 2)) / BROW_WOBBLE_PERIOD);
  const brow = {
    x: up.x,
    y: up.y - r * 0.36,
    r: r * 0.9,
    ry: r * 0.42,
    angle: browWobble,
  };
  drawPlate(ctx, skull, fade, 0.7, hurt, brow);
  drawScales(ctx, skull, brow, r * 0.12, fade);
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
  for (const s of [-1, 1] as const) {
    const open = s === 1 ? f.eye * (1 - 0.8 * f.wince) : f.eye;
    drawEye(ctx, frontEyeAt(f, top, r, s), r, s, open, time, fade);
  }
}
