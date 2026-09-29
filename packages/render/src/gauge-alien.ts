import { blobRadiusMul, type Point } from "@neon-spore/content";
import { GAUGE_FULL } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { strokeGlow } from "./glow.js";
import { mixHex } from "./hex.js";
import { PALETTE } from "./palette.js";
import { splinePath } from "./spline.js";

/**
 * THE GAUGE's enemy: a big alien ship hung over ours with its mouth open round
 * it — the owner, 25 September 2026: *show a big alien ship, and the line
 * where the needle is correct is the visual of an open wound*.
 *
 * **The shape is THE MOTHER's**, taken out of the shape collection
 * (`tools/shape-sheet/src/drafts/bosses.ts`, `mawed`): a body that is mostly
 * opening, with leaning arms round it. It is centred on the cannon's pivot, so
 * the mouth's rim is a curve the cannon faces at every angle of its half-turn
 * and the ship sits inside the open mouth; the hull is drawn over the lower
 * half. Six arms on a sixty-degree slot put three of them in the sky — up,
 * and up either side — and the other three under the hull.
 *
 * **The rim is the dial.** A shot leaves the pivot and meets the rim at the
 * angle the needle stands at, so everything the round is judged by is an
 * angle about one point, as it always was. The rim does not breathe: the
 * wound, the aim mark and the two thumbs all stand on it, and a thing that is
 * aimed at must not move while the arm aiming at it is still.
 *
 * **The rim is teeth everywhere the wound is not.** They were grey plates, and
 * on 29 September 2026 the owner asked for the face they were half of: *i like
 * idea that visual it looks like a mouth, can you enhance that we see like a
 * face of an alien and some open mouth visual e.g. tongue and eyes*. Bone, so
 * a shot landing on them still reads as the hard thing it is; the eyes and the
 * tongue are `gauge-face.ts`. The wound
 * is flesh in the colour of the loaded shot (`gauge-wound.ts`); the colours
 * a pair reads as *hit this* are only ever there.
 */

/** The rim's distance from the pivot, as a share of the dial's radius — out
 * from 0.9 on 29 September 2026, so the mouth stands further off the cannon. */
export const RIM = 0.97;
/** The body's middle distance, and the arms' extra reach, as shares of it. */
const BODY = 1.62;
const ARM_REACH = 0.42;
const ARMS = 6;
/** How many points round each of the two loops. */
const N = 96;
/** The teeth: how many across the half-turn, and how far each points in. */
const TEETH = 15;
const TOOTH_DEPTH = 0.1;
const BONE = "#D8CCAA";
const BONE_DARK = "#5E5645";

/** Where a value on the dial points, as a canvas angle. Left is 0, right is full. */
export function angleOf(milli: number): number {
  return Math.PI + (milli / GAUGE_FULL) * Math.PI;
}

/** The rim's radius at canvas angle `a`: a few slow lumps, never in time. */
function rimMul(a: number): number {
  return 1 + 0.035 * Math.sin(5 * a + 0.7) + 0.02 * Math.sin(3 * a - 1.1);
}

/** The rim's distance from the pivot where `milli` points, in pixels. */
export function rimRadius(dial: Dial, milli: number): number {
  return dial.r * RIM * rimMul(angleOf(milli));
}

/**
 * A point on the rim where `milli` points, moved `out` pixels further from
 * the pivot — negative is towards the cannon, into the open mouth.
 */
export function rimPoint(dial: Dial, milli: number, out = 0): Point {
  const a = angleOf(milli);
  const d = rimRadius(dial, milli) + out;
  return { x: dial.cx + Math.cos(a) * d, y: dial.cy + Math.sin(a) * d };
}

/**
 * The body's outer edge at time `t`: THE MOTHER's contour, the spike on each
 * arm leaning off a wider shoulder behind it. `flinch` is how hard it is
 * recoiling from a hit, 0..1 — the arms throw out.
 */
function outline(dial: Dial, t: number, flinch: number): Point[] {
  const r = dial.r * BODY;
  const slot = (Math.PI * 2) / ARMS;
  const reach = ARM_REACH * (1 + 0.35 * flinch);
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const off = (((a % slot) + slot) % slot) / slot - 0.5;
    const skew = off < 0 ? off / 0.62 : off / 0.38;
    const spike = Math.max(0, Math.cos(skew * Math.PI)) ** 2;
    const m = blobRadiusMul(a, 2, 0.09, 0.05, t, 14.8) * (1 + reach * spike);
    pts.push({ x: dial.cx + Math.cos(a) * r * m, y: dial.cy + Math.sin(a) * r * m });
  }
  return pts;
}

function rimLoop(dial: Dial): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const d = dial.r * RIM * rimMul(a);
    pts.push({ x: dial.cx + Math.cos(a) * d, y: dial.cy + Math.sin(a) * d });
  }
  return pts;
}

/** The alien's flesh with the light off it, and its own edge. */
const FLESH = "#120B1E";
const SKIN = PALETTE.venom;

/**
 * The alien, its mouth and the armour round the mouth. Drawn before the hull,
 * so our ship stands in front of the half of it that is below the crown.
 */
export function drawGaugeAlien(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  time: number,
  flinch: number,
): void {
  const body = new Path2D();
  body.addPath(splinePath(outline(dial, time, flinch), true));
  const rim = splinePath(rimLoop(dial), true);
  body.addPath(rim);

  ctx.save();
  ctx.fillStyle = FLESH;
  ctx.fill(body, "evenodd");
  // A deeper band just outside the mouth, so the rim reads as a lip the body
  // folds over and not as a hole punched in a flat sheet.
  ctx.clip(body, "evenodd");
  ctx.strokeStyle = mixHex(FLESH, SKIN, 0.18);
  ctx.lineWidth = dial.r * 0.34;
  ctx.stroke(rim);
  ctx.restore();

  strokeGlow(ctx, splinePath(outline(dial, time, flinch), true), SKIN, 2, 0.55 + 0.4 * flinch);
  drawTeeth(ctx, dial);
}

/**
 * The teeth round the mouth: one fang each, over the half-turn the cannon can
 * face and a little past both ends, so the jaw runs on under the hull rather
 * than stopping where the dial does.
 */
function drawTeeth(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const step = GAUGE_FULL / TEETH;
  const depth = dial.r * TOOTH_DEPTH;
  ctx.save();
  ctx.lineJoin = "round";
  for (let k = -1; k <= TEETH + 1; k++) {
    const lo = k * step;
    // Every other one a little shorter, so the row is a jaw and not a saw.
    const path = toothPath(dial, lo, lo + step, depth * (k % 2 === 0 ? 1 : 0.8));
    ctx.fillStyle = BONE_DARK;
    ctx.fill(path);
    ctx.strokeStyle = BONE;
    ctx.lineWidth = 1.4;
    ctx.stroke(path);
  }
  ctx.restore();
}

/** One fang from `lo` to `hi` on the rim, its point `depth` towards the cannon. */
function toothPath(dial: Dial, lo: number, hi: number, depth: number): Path2D {
  const path = new Path2D();
  const steps = 6;
  for (let i = 0; i <= steps; i++) {
    const m = lo + ((hi - lo) * i) / steps;
    const p = rimPoint(dial, m, depth * 0.3);
    if (i === 0) path.moveTo(p.x, p.y);
    else path.lineTo(p.x, p.y);
  }
  for (let i = steps; i >= 0; i--) {
    const u = i / steps;
    // Full at the root and drawn to a blunt point in the middle.
    const p = rimPoint(dial, lo + (hi - lo) * u, -depth * Math.sin(Math.PI * u) ** 1.6);
    path.lineTo(p.x, p.y);
  }
  path.closePath();
  return path;
}
