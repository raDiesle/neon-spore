import { blobRadiusMul, type Point } from "@neon-spore/content";
import { heldGradient } from "./gradient-held.js";
import { rgba } from "./hex.js";
import { PALETTE } from "./palette.js";
import { WHOLE, type Window } from "./rock-window.js";
import { splinePath } from "./spline.js";

/**
 * THE FIRE ON A BURNING ROCK — the other half of `wake.ts`, split off for the
 * file limit along the seam that is true anyway: everything here is light,
 * drawn additively in the palette's ember and its rim, and everything there
 * is smoke and stone, drawn over the field.
 *
 * Both marks are drawn from their arguments and `time` alone; nothing caches a
 * frame, for the reason `wake.ts` gives — except a flame's *ramp*, which runs
 * from the foot to the crown with stops set by `heat`, none of which moves, so
 * it is held (`heldGradient`); the contour is what boils, and that is built
 * every frame.
 *
 * Both take a `Window` last and ask it before building anything, for
 * `wake.ts`'s reason: under THE CAIRN's clip most of a fire shows nowhere
 * (`rock-window.ts`).
 */

/**
 * One tongue of flame: a teardrop with its bright end at `(x, y)`, its tip
 * `len` away along `angle` and bent `bend` to the side of that line, with a
 * hotter, narrower core inside it. Additive, because fire is its own light —
 * two tongues crossing are brighter, never muddier.
 */
export function tongue(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  len: number,
  wide: number,
  angle: number,
  heat: number,
  bend = 0,
  w: Window = WHOLE,
): void {
  if (len <= 0 || wide <= 0 || heat <= 0) return;
  // Everything the drop reaches lies within its length, its bend and its
  // round end of the bright end, whichever way it is turned.
  if (!w.shows(x, y, len + wide + Math.abs(bend))) return;
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);
  ctx.globalCompositeOperation = "lighter";
  drop(ctx, len, wide, bend, rgba(PALETTE.ember, 0.75 * heat), rgba(PALETTE.ember, 0));
  drop(
    ctx,
    len * 0.62,
    wide * 0.5,
    bend * 0.6,
    rgba(PALETTE.emberRim, 0.85 * heat),
    rgba(PALETTE.emberRim, 0),
  );
  ctx.restore();
}

/** A teardrop along +x from a round end at the origin, bent to the side. */
function drop(
  ctx: CanvasRenderingContext2D,
  len: number,
  wide: number,
  bend: number,
  from: string,
  to: string,
): void {
  const g = ctx.createLinearGradient(0, 0, len, bend);
  g.addColorStop(0, from);
  g.addColorStop(0.35, from);
  g.addColorStop(1, to);
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(0, -wide);
  ctx.quadraticCurveTo(len * 0.5, -wide * 0.9 + bend * 0.3, len, bend);
  ctx.quadraticCurveTo(len * 0.5, wide * 0.9 + bend * 0.3, 0, wide);
  ctx.arc(0, 0, wide, Math.PI / 2, (Math.PI * 3) / 2);
  ctx.closePath();
  ctx.fill();
}

/** The most `blobRadiusMul` can stretch a flame's contour, at the depth and
 * wobble below: (1 + 0.2)(1 + 0.16)(1 + 0.096)(1 + 0.064)(1.02), rounded up. */
const BOIL = 1.7;

/**
 * A body of flame: a boiling contour, `w` wide at its foot and `h` tall,
 * standing on `(x, y)` and narrowing as it rises — bright at its foot and gone
 * at its crown, its edge moving on `time` the way the torch's ball boils
 * (`torch-ball.ts`). Two or three of these at different sizes and phases are
 * the mass of a fire; the tongues are what licks out of it.
 */
export function flame(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  time: number,
  seed: number,
  heat: number,
  win: Window = WHOLE,
): void {
  if (w <= 0 || h <= 0 || heat <= 0) return;
  const cy = y - h * 0.5;
  // The contour is the ellipse `w` by `h` round `(x, cy)`, boiled out by at
  // most `BOIL` of itself — `blobRadiusMul`'s four factors at their peaks.
  if (!win.shows(x, cy, BOIL * Math.hypot(w, h * 0.5))) return;
  const N = 24;
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = blobRadiusMul(a, 5, 0.2, 0.16, time * 2.4 + seed, seed);
    const py = cy + Math.sin(a) * h * 0.5 * m;
    // How far up the flame this point is, 0 at the foot and 1 at the crown;
    // the contour narrows with it, which is what makes it a flame and not an
    // egg of light.
    const up = Math.min(1, Math.max(0, (y - py) / h));
    pts.push({ x: x + Math.cos(a) * w * m * (1 - 0.6 * up * up), y: py });
  }
  const path = splinePath(pts, true);
  ctx.save();
  ctx.globalCompositeOperation = "lighter";
  // Callers pass a handful of fixed multiples of a rock's radius for all
  // three, so the held set stays a handful.
  ctx.fillStyle = heldGradient(`flame@${y}|${h}|${heat}`, () => {
    const g = ctx.createLinearGradient(0, y, 0, y - h);
    g.addColorStop(0, rgba(PALETTE.emberRim, 0.55 * heat));
    g.addColorStop(0.2, rgba(PALETTE.ember, 0.7 * heat));
    g.addColorStop(0.6, rgba(PALETTE.ember, 0.22 * heat));
    g.addColorStop(1, rgba(PALETTE.ember, 0));
    return g;
  });
  ctx.fill(path);
  ctx.restore();
}
