import { GAUGE_FULL, GAUGE_TEETH } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { rimPoint, rimRadius } from "./gauge-alien.js";
import { strokeGlow } from "./glow.js";

/**
 * **THE GAUGE's teeth**, out of `gauge-alien.ts` once they stopped being a
 * row of bone and became things a hand can take out. The owner, 29 September
 * 2026: *pull teeth out ( p1 needs to tell p2 which one to pull out.)*
 *
 * Three states a tooth can be in besides standing, each drawn to be told
 * apart from across a table (`docs/looks.md`, *big enough to see*):
 *
 * - **Out**: a dark socket of gum where it stood, on both screens — the pair
 *   hears a wrong pull as the gap it left, and a right one as the round going on.
 * - **Loose**: rocking in its socket, a quarter of its own width either way on
 *   a fast shake, bobbing in and out, and glowing — on the pilot's screen
 *   alone (`showsGaugeValve`). That is the round's split turned round for one
 *   rest: he sees which, she has the hand (`sim/gauge-tooth.ts`).
 * - **Held**: carried with her thumb, wherever the drag has it, on both
 *   screens — so he can see which one she has hold of and say *not that one*.
 *
 * `GAUGE_TEETH` is the simulation's: the tooth she presses is the tooth the
 * simulation counts, and a picture with one more would be a count he gave
 * her that the round would not agree with.
 */

/** How far each points in, as a share of the dial's radius. */
export const TOOTH_DEPTH = 0.1;
const BONE = "#D8CCAA";
const BONE_DARK = "#5E5645";
const GUM = "#3A0F22";
const GUM_EDGE = "#8A2A4A";

/** What this screen shows of the teeth. Pixels, not thousandths. */
export interface TeethView {
  /** Bit `k` set for every tooth out (`GaugeState.pulledTeeth`). */
  pulled: number;
  /** The loose tooth where this screen shows it, `-1` where it does not. */
  loose: number;
  /** The tooth in her hand, or `-1`. */
  hold: number;
  /** How far her hand has carried it, in pixels. */
  dx: number;
  dy: number;
}

/** The dial's share one tooth spans. */
export const TOOTH_STEP = GAUGE_FULL / GAUGE_TEETH;

/** Every other tooth a little shorter, so the row is a jaw and not a saw. */
function depthOf(dial: Dial, k: number): number {
  return dial.r * TOOTH_DEPTH * (k % 2 === 0 ? 1 : 0.8);
}

/**
 * The teeth round the mouth: one fang each, over the half-turn the cannon can
 * face and a little past both ends, so the jaw runs on under the hull rather
 * than stopping where the dial does. The loose and the held tooth go down
 * last, over their neighbours.
 */
export function drawTeeth(
  ctx: CanvasRenderingContext2D,
  dial: Dial,
  teeth: TeethView,
  time: number,
): void {
  ctx.save();
  ctx.lineJoin = "round";
  for (let k = -1; k <= GAUGE_TEETH + 1; k++) {
    const lo = k * TOOTH_STEP;
    // The two past the ends are jaw, never a tooth the round counts: `-1` is
    // also what `loose` and `hold` say when there is none.
    const counted = k >= 0 && k < GAUGE_TEETH;
    const gone = (teeth.pulled & (1 << k)) !== 0 || k === teeth.hold || k === teeth.loose;
    if (counted && gone) {
      drawSocket(ctx, dial, lo);
      continue;
    }
    drawBone(ctx, toothPath(dial, lo, lo + TOOTH_STEP, depthOf(dial, k)));
  }
  if (teeth.loose !== -1 && teeth.loose !== teeth.hold) drawLoose(ctx, dial, teeth.loose, time);
  if (teeth.hold !== -1) drawHeld(ctx, dial, teeth);
  ctx.restore();
}

function drawBone(ctx: CanvasRenderingContext2D, path: Path2D): void {
  ctx.fillStyle = BONE_DARK;
  ctx.fill(path);
  ctx.strokeStyle = BONE;
  ctx.lineWidth = 1.4;
  ctx.stroke(path);
}

/** The gum a tooth stood in: a short dark stump with a raw edge. */
function drawSocket(ctx: CanvasRenderingContext2D, dial: Dial, lo: number): void {
  const path = toothPath(dial, lo + TOOTH_STEP * 0.12, lo + TOOTH_STEP * 0.88, dial.r * 0.035);
  ctx.fillStyle = GUM;
  ctx.fill(path);
  ctx.strokeStyle = GUM_EDGE;
  ctx.lineWidth = 1.4;
  ctx.stroke(path);
}

/** The loose one, rocking and bobbing in its socket, lit so it is found first. */
function drawLoose(ctx: CanvasRenderingContext2D, dial: Dial, k: number, time: number): void {
  const rock = TOOTH_STEP * 0.25 * Math.sin(time * 15);
  const bob = 1 + 0.18 * Math.sin(time * 9 + 1);
  const lo = k * TOOTH_STEP + rock;
  const path = toothPath(dial, lo, lo + TOOTH_STEP, depthOf(dial, k) * bob);
  strokeGlow(ctx, path, BONE, 2, 0.9 + 0.3 * Math.sin(time * 6));
  drawBone(ctx, path);
}

/** The one in her hand, carried off its socket by the drag. */
function drawHeld(ctx: CanvasRenderingContext2D, dial: Dial, teeth: TeethView): void {
  const lo = teeth.hold * TOOTH_STEP;
  const path = toothPath(dial, lo, lo + TOOTH_STEP, depthOf(dial, teeth.hold));
  ctx.save();
  ctx.translate(teeth.dx, teeth.dy);
  strokeGlow(ctx, path, BONE, 2, 0.7);
  drawBone(ctx, path);
  ctx.restore();
}

/**
 * Where tooth `k` stands, for the ring on it and the word over it: halfway
 * along it and a little in from the root, on the bone rather than the lip.
 */
export function toothPoint(dial: Dial, k: number): { x: number; y: number } {
  return rimPoint(dial, (k + 0.5) * TOOTH_STEP, -depthOf(dial, k) * 0.45);
}

/**
 * Which tooth a press at (x, y) is on, by the angle round the pivot — the
 * teeth touch one another, so the angle names exactly one — or `-1` for a
 * press off the dial's half-turn, or nearer the pivot or the sky than `reach`
 * pixels either side of the rim.
 */
export function toothAt(dial: Dial, x: number, y: number, reach: number): number {
  const a = Math.atan2(y - dial.cy, x - dial.cx);
  if (a >= 0) return -1;
  const milli = ((a + Math.PI) / Math.PI) * GAUGE_FULL;
  const k = Math.floor(milli / TOOTH_STEP);
  if (k < 0 || k >= GAUGE_TEETH) return -1;
  const d = Math.hypot(x - dial.cx, y - dial.cy) - rimRadius(dial, milli);
  return d < -reach * 1.5 || d > reach ? -1 : k;
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
