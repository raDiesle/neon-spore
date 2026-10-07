import { KEY } from "@neon-spore/content";
import { GAUGE_FULL, GAUGE_TEETH } from "@neon-spore/sim";
import type { Dial } from "./gauge.js";
import { rimLoop, rimPoint, rimRadius } from "./gauge-alien.js";
import { strokeGlow } from "./glow.js";
import { splinePath } from "./spline.js";

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
/** The far side of a tooth from the light: bone in the cool shadow. */
const BONE_SHADE = "#2A2533";
const ENAMEL = "#F4ECD6";
const GUM = "#3A0F22";
const GUM_EDGE = "#8A2A4A";
/** The band of gum the whole row stands in: darker and more violet than a
 * socket's, so an empty socket is still told apart from it. */
const GUM_BAND = "#2A0D26";
/** The gum's lit crown: mauve, never the wound's red. */
const GUM_LIT = "#6E3A6E";

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
export function depthOf(dial: Dial, k: number): number {
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
  drawGums(ctx, dial);
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
    drawBone(ctx, dial, lo, toothPath(dial, lo, lo + TOOTH_STEP, depthOf(dial, k)));
  }
  if (teeth.loose !== -1 && teeth.loose !== teeth.hold) drawLoose(ctx, dial, teeth.loose, time);
  if (teeth.hold !== -1) drawHeld(ctx, dial, teeth);
  ctx.restore();
}

/**
 * One tooth, shaded as a cone under the key light — the owner, 7 October
 * 2026, *more details and 3d depth*. Across its root, from the side that faces
 * the light to the side that does not: a bright enamel streak a quarter of the
 * way in, the bone, then the cool shadow. `lo` is where it starts on the dial,
 * which is all the light needs to know which side that is.
 */
function drawBone(ctx: CanvasRenderingContext2D, dial: Dial, lo: number, path: Path2D): void {
  const a = rimPoint(dial, lo);
  const b = rimPoint(dial, lo + TOOTH_STEP);
  // Whichever end of the root faces the light is where the light comes in.
  const litB = (b.x - a.x) * KEY.x + (b.y - a.y) * KEY.y > 0;
  const [from, to] = litB ? [b, a] : [a, b];
  const g = ctx.createLinearGradient(from.x, from.y, to.x, to.y);
  g.addColorStop(0, BONE_DARK);
  g.addColorStop(0.22, ENAMEL);
  g.addColorStop(0.42, BONE);
  g.addColorStop(0.75, BONE_DARK);
  g.addColorStop(1, BONE_SHADE);
  ctx.fillStyle = g;
  ctx.fill(path);
  ctx.strokeStyle = BONE_DARK;
  ctx.lineWidth = 1.2;
  ctx.stroke(path);
}

/**
 * The gum the teeth stand in: a swollen band round the rim, dark where it
 * meets the bone and lit along its outer crown, so the teeth come *out of*
 * something rather than being stuck on a line.
 */
function drawGums(ctx: CanvasRenderingContext2D, dial: Dial): void {
  const depth = dial.r * TOOTH_DEPTH;
  const k = 1 + (depth * 0.25) / rimRadius(dial, GAUGE_FULL / 2);
  const band = splinePath(rimLoop(dial, k), true);
  ctx.strokeStyle = GUM_BAND;
  ctx.lineWidth = depth * 0.75;
  ctx.stroke(band);
  ctx.strokeStyle = GUM_LIT;
  ctx.lineWidth = Math.max(1.2, depth * 0.14);
  ctx.save();
  ctx.translate(KEY.x * depth * 0.18, KEY.y * depth * 0.18);
  ctx.stroke(splinePath(rimLoop(dial, k + (depth * 0.3) / dial.r), true));
  ctx.restore();
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
  drawBone(ctx, dial, lo, path);
}

/** The one in her hand, carried off its socket by the drag. */
function drawHeld(ctx: CanvasRenderingContext2D, dial: Dial, teeth: TeethView): void {
  const lo = teeth.hold * TOOTH_STEP;
  const path = toothPath(dial, lo, lo + TOOTH_STEP, depthOf(dial, teeth.hold));
  ctx.save();
  ctx.translate(teeth.dx, teeth.dy);
  strokeGlow(ctx, path, BONE, 2, 0.7);
  drawBone(ctx, dial, lo, path);
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
export function toothPath(dial: Dial, lo: number, hi: number, depth: number): Path2D {
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
