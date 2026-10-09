import type { TasterState } from "@neon-spore/sim";
import { strokeGlow } from "./glow.js";
import { rgba } from "./hex.js";
import { PALETTE, STROKE } from "./palette.js";

/**
 * **The ridge THE TASTER's blades stand out of**, and the two things the pair
 * can do to it: open a gap where a blade used to be, and cut the gaps through.
 *
 * Its own file beside `taster-blade.ts` for that file's reason — the fan's
 * shapes are one subject and the crest is another — and because the crest is
 * the half of this boss with no colour anywhere on it. It takes a bolt of
 * either (`sim/taster-shot.ts`), which is exactly why it is drawn in the
 * hull's own grey and violet and never in an ammunition colour: the one target
 * in this fight the navigator has no word for.
 */

/**
 * The ridge, left to right, as a closed shape: a shallow arc with a slow
 * ripple along its underside.
 *
 * The ripple is wall-clock own-motion, the membrane's argument said about
 * something solid — a crest drawn as a rectangle would be a lid, and this is
 * a living edge the blades grow out of. Its top is flat, because every blade's
 * base sits on it and a base hanging off a curve would read as a blade coming
 * loose.
 */
export function crestPath(
  left: number,
  right: number,
  y: number,
  thick: number,
  tile: number,
  time: number,
): Path2D {
  const [first, ...rest] = crestPoints(left, right, y, thick, tile, time);
  const p = new Path2D();
  if (first === undefined) return p;
  p.moveTo(first.x, first.y);
  for (const q of rest) p.lineTo(q.x, q.y);
  p.closePath();
  return p;
}

/** The crest's corners in order: its flat top, then its wavering underside back. Drawn so and met so (`taster-stop.ts`). */
export function crestPoints(
  left: number,
  right: number,
  y: number,
  thick: number,
  tile: number,
  time: number,
): { x: number; y: number }[] {
  const points = [
    { x: left, y },
    { x: right, y },
  ];
  const steps = 12;
  for (let i = steps; i >= 0; i--) {
    const x = left + ((right - left) * i) / steps;
    const wave = Math.sin(time * 0.8 + i * 0.7) * tile * 0.04;
    points.push({ x, y: y + thick + wave });
  }
  return points;
}

/**
 * How far on gap `i` is: its own cuts out of the four that open the crest
 * (`TasterBlade.cuts`, 7 October 2026), so each gap is drawn at its own depth.
 */
export function notchWet(t: TasterState, i: number, crestCuts: number): number {
  return Math.min(1, (t.blades[i]?.cuts ?? 0) / Math.max(1, crestCuts));
}

/**
 * A gap: the crest under a blade that has been struck off, soft and visibly
 * wet — the design's own words, and player 1's target — cut as deep as the
 * pair has cut it. A dent where nobody has fired, so an untouched gap still
 * reads as the target it is; down through the crest and far out under it at
 * four. Wider, darker and wetter the deeper it goes, so the gaps the pilot has
 * been feeding read at a glance against the ones nobody has touched.
 *
 * Taken from VERSUS (`taster:notch` · deep) on 9 October 2026, three times
 * as deep as it was offered, at the owner's word.
 */
export function drawNotch(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  tile: number,
  thick: number,
  wet: number,
  breath: number,
): void {
  const w = tile * (0.32 + 0.14 * wet);
  // The curve's apex is half its control point.
  const deep = thick * (0.7 + 8.3 * wet);
  const dent = new Path2D();
  dent.moveTo(x - w, y);
  dent.quadraticCurveTo(x, y + deep, x + w, y);
  ctx.save();
  ctx.globalAlpha = 0.35 + 0.55 * wet;
  ctx.fillStyle = PALETTE.background;
  ctx.fill(dent);
  // The sheen: its wall lit from inside, which is what makes it read as wet
  // rather than as a hole, and it is the hull's violet because the gap is the
  // one part of this boss that answers to either colour.
  ctx.clip(dent);
  ctx.lineWidth = tile * (0.1 + 0.08 * wet);
  ctx.strokeStyle = PALETTE.hull;
  ctx.globalAlpha = 0.55 + 0.35 * wet + 0.1 * breath;
  ctx.stroke(dent);
  ctx.restore();
  // The drop, sunk to the bottom of it and swollen with every cut.
  ctx.save();
  ctx.fillStyle = rgba(PALETTE.sheenRim, 0.35 + 0.55 * wet);
  ctx.beginPath();
  const r = tile * (0.035 + 0.05 * wet);
  ctx.ellipse(x - w * 0.15, y + deep * 0.42, r, r * 0.55, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

/**
 * **How a gap is drawn, as a record**, so VERSUS can offer another answer
 * beside it (`tools/versus/`). `wet` says how far on gap `i` is drawn, 0..1,
 * out of the cuts that open the crest (`tasterCrestCuts`); `paint` is `drawNotch` or its
 * stand-in. `taster-draw.ts` reads both off this object on every frame.
 */
export interface NotchLook {
  wet: (t: TasterState, i: number, crestCuts: number) => number;
  paint: typeof drawNotch;
}

export const NOTCH_LOOK: NotchLook = {
  wet: notchWet,
  paint: drawNotch,
};

/**
 * The crest cut through: a lit seam the whole width of it, and from here the
 * fan can never re-edge itself again (`tasterLift`).
 *
 * It is drawn along the ridge rather than thrown as a transient because it is
 * a **standing** fact for the rest of the fight — the four shots into the gaps
 * bought it, and the pair has to be able to see at any later moment that the
 * shiver is not coming back.
 */
export function drawSeam(
  ctx: CanvasRenderingContext2D,
  left: number,
  right: number,
  y: number,
  tile: number,
  time: number,
): void {
  const seam = new Path2D();
  seam.moveTo(left, y + tile * 0.16);
  seam.lineTo(right, y + tile * 0.16);
  const pulse = 0.45 + 0.15 * Math.sin(time * 2);
  strokeGlow(ctx, seam, PALETTE.hullRim, STROKE.inner, pulse);
}
