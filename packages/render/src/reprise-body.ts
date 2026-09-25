import { blobRadiusMul, type Point } from "@neon-spore/content";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import type { Layout } from "./layout.js";
import { PALETTE, STROKE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * **THE REPRISE's body: a heavy sac hung through the tear**, and the light
 * that puts it in front of the pair.
 *
 * The owner, 25 September 2026: *increase the graphics of boss … boss can be
 * somehow more visible on the screen, some more focus*. Until then the boss
 * was a torn edge with a dark mass under it, two and a half columns wide and
 * three quarters of a row deep, and on a phone it read as damage to the field
 * rather than as the thing the fight is against. So it has a body now: THE
 * WEIGHT from `tools/shape-sheet/src/drafts/bosses.ts` — *a sac hung heavy,
 * narrow at the top* — pushed down through THE BREACH's tear, which is the
 * shape it had and which it keeps, so the silhouette still says *the wave
 * went up there and comes back out of it*. Two cords hang it from the top of
 * the screen; the eye and the count are drawn into it by `reprise-lens.ts` and
 * `reprise-brood.ts`.
 *
 * **Focus is a halo and, while it plays, a beam.** A soft light stands behind
 * the sac and pulses on each beat, so the eye finds it on an empty screen; and
 * while an echo runs, a pale cone falls from the lens across the whole field,
 * the projector that is playing the wave back. The cone is the full width of
 * the field at the hull, so it lights no column over another.
 *
 * Rock grey throughout, for `reprise-draw.ts`'s reason: a colour on this body
 * would be half of what the pair was meant to remember.
 */

/** Where the body hangs and how big it is, worked out once per frame. */
export interface RepriseFrame {
  /** The middle column's centre, which the body never leaves. */
  x: number;
  /** The field's own top edge, where the tear is. */
  y0: number;
  /** The middle of the sac, and of the lens in it. */
  cy: number;
  /** The body's unit: a tile, or less where the screen has less room above
   * the field. */
  u: number;
  /** The sac's half-width and half-height at rest. */
  rx: number;
  ry: number;
}

/** A light behind the body, brighter while it plays, lifted on each beat. */
export function drawHalo(
  ctx: CanvasRenderingContext2D,
  f: RepriseFrame,
  playing: boolean,
  beatPhase: number,
): void {
  const pulse = (1 - beatPhase) ** 3;
  const r = f.u * 3.6;
  const g = ctx.createRadialGradient(f.x, f.cy, f.u * 0.4, f.x, f.cy, r);
  g.addColorStop(0, rgba(PALETTE.rock, (playing ? 0.2 : 0.13) + 0.07 * pulse));
  g.addColorStop(0.5, rgba(PALETTE.dim, playing ? 0.1 : 0.06));
  g.addColorStop(1, rgba(PALETTE.dim, 0));
  ctx.fillStyle = g;
  ctx.fillRect(f.x - r, f.cy - r, r * 2, r * 2);
}

/** The projector's beam down the dark field, `a` of its full strength. */
export function drawBeam(
  ctx: CanvasRenderingContext2D,
  l: Layout,
  f: RepriseFrame,
  a: number,
): void {
  if (a <= 0) return;
  const top = f.u * 0.5;
  const g = ctx.createLinearGradient(0, f.cy, 0, l.hullY);
  g.addColorStop(0, rgba(PALETTE.rock, 0.16 * a));
  g.addColorStop(0.35, rgba(PALETTE.rock, 0.06 * a));
  g.addColorStop(1, rgba(PALETTE.rock, 0.015 * a));
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(f.x - top, f.cy);
  ctx.lineTo(f.x + top, f.cy);
  ctx.lineTo(l.gridLeft + l.gridWidth, l.hullY);
  ctx.lineTo(l.gridLeft, l.hullY);
  ctx.closePath();
  ctx.fill();
}

/** The sac's contour: lobed, heavier at the bottom than at the top. `clench`
 * narrows it and draws it down, the swallow. */
function sacPoints(f: RepriseFrame, clench: number, t: number): Point[] {
  const N = 36;
  const rx = f.rx * (1 - 0.07 * clench);
  const ry = f.ry * (1 + 0.09 * clench);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (Math.PI * 2 * i) / N;
    const m = blobRadiusMul(a, 5, 0.06, 0.025, t, 7.3);
    // Narrow at the top, heavy at the bottom: THE WEIGHT's whole silhouette.
    const heavy = 0.8 + 0.2 * Math.sin(a);
    pts.push({ x: f.x + Math.cos(a) * rx * m * heavy, y: f.cy + Math.sin(a) * ry * m });
  }
  return pts;
}

/** The two cords it hangs from, up to the top of the screen. */
function drawCords(ctx: CanvasRenderingContext2D, f: RepriseFrame, t: number): void {
  for (const side of [-1, 1]) {
    const root = { x: f.x + side * f.rx * 0.42, y: f.cy - f.ry * 0.8 };
    const sway = Math.sin(t * 0.7 + side) * f.u * 0.08;
    const cord = new Path2D();
    cord.moveTo(root.x, root.y);
    cord.quadraticCurveTo(
      root.x + side * f.u * 0.5 + sway,
      root.y - f.u,
      root.x + side * f.u * 0.9,
      0,
    );
    ctx.lineCap = "round";
    ctx.lineWidth = f.u * 0.16;
    ctx.strokeStyle = rgba(PALETTE.rockDark, 0.95);
    ctx.stroke(cord);
    strokeGlow(ctx, cord, PALETTE.rock, STROKE.inner, 0.35);
  }
}

/** The sac, filled and lit, and its contour for what is drawn into it. */
export function drawSac(
  ctx: CanvasRenderingContext2D,
  f: RepriseFrame,
  playing: boolean,
  clench: number,
  t: number,
): Path2D {
  drawCords(ctx, f, t);
  const sac = splinePath(sacPoints(f, clench, t), true);
  ctx.save();
  ctx.fillStyle = PALETTE.rockDark;
  ctx.fill(sac);
  // Skin: lit from the upper left, deep violet in the folds, so it reads as a
  // grown thing with weight in it rather than a flat grey badge.
  const skin = ctx.createRadialGradient(
    f.x - f.rx * 0.35,
    f.cy - f.ry * 0.45,
    f.u * 0.1,
    f.x,
    f.cy,
    f.rx * 1.1,
  );
  skin.addColorStop(0, rgba(PALETTE.rock, 0.42));
  skin.addColorStop(0.45, rgba(PALETTE.rockDark, 0.2));
  skin.addColorStop(1, rgba(PALETTE.sheenDeep, 0.85));
  ctx.fillStyle = skin;
  ctx.fill(sac);
  ctx.clip(sac);
  // Veins on the two outer lobes, faint, running down to where it is heavy.
  ctx.lineCap = "round";
  ctx.lineWidth = Math.max(0.8, f.u * 0.04);
  ctx.strokeStyle = rgba(PALETTE.sheenRim, 0.12);
  for (const side of [-1, 1]) {
    for (const k of [0.62, 0.8]) {
      ctx.beginPath();
      ctx.moveTo(f.x + side * f.rx * k, f.cy - f.ry * 0.6);
      ctx.quadraticCurveTo(
        f.x + side * f.rx * (k + 0.12),
        f.cy,
        f.x + side * f.rx * (k - 0.1),
        f.cy + f.ry * 0.8,
      );
      ctx.stroke();
    }
  }
  // A film of gloss over the top of the curve.
  ctx.strokeStyle = rgba(PALETTE.text, 0.22);
  ctx.lineWidth = f.u * 0.08;
  ctx.beginPath();
  ctx.ellipse(f.x, f.cy, f.rx * 0.78, f.ry * 0.78, 0, Math.PI * 1.15, Math.PI * 1.45);
  ctx.stroke();
  ctx.restore();
  strokeGlow(ctx, sac, PALETTE.rock, STROKE.outline * 1.3, playing ? 1 : 0.75);
  return sac;
}
