import { blobRadiusMul } from "@neon-spore/content";
import type { Layout } from "./layout.js";
import { splinePath } from "./spline.js";

/**
 * **THE MIMIC's shape** (§42, *Silhouette*): two drafts combined, named on
 * the shape sheet **BLOOM · GLYPHED**. The body is `bloom`'s core and arms,
 * THE VESSEL's draft, set to eight arms of even length, each a rounded lobe;
 * the skin is `glyphed`'s rim of marks, THE CODEX's form, cut into the
 * mantle's edge instead of a slab's, and marching round it as the skin
 * ripples.
 *
 * Everything here is geometry in the field's pixels and nothing is read off
 * the world: the pose says where the mantle is, how round, how far each arm
 * is out and how far the skin has split (`mimic-pose.ts`), and this turns it
 * into paths.
 */

export interface Point {
  x: number;
  y: number;
}

/** Where the mantle is, and what shape it is in, this frame. */
export interface MimicPose {
  /** The mantle's middle. */
  x: number;
  y: number;
  /** Its radius, in pixels. */
  r: number;
  /** How round it stands, top to bottom: low flattened against the top, past one in the slap. */
  squash: number;
  /** Its roll, as the width it shows: one face-on, nought edge-on, below nought the other face. */
  turn: number;
  /** How far out each of the eight arms is, nought to one. */
  arms: readonly number[];
  /** The skin's ripple, in radians, off the beat. */
  wave: number;
  /** How far the two halves have parted, nought whole to one wide open on the core. */
  split: number;
  /** How bare and lit the core is, nought to one. */
  core: number;
  /** How far the reaching arm hangs down past the mantle, in pixels. */
  reach: number;
  /** How far gone it is, spent: nought whole to one shapeless and fallen. */
  spent: number;
  /** Which face is turned to the pair, for the mottle it wears. */
  face: 1 | 2;
}

/** The mantle's radius at rest, in tiles. */
export const MANTLE = 1.5;
/** The arms: how many, and how far a full one goes past the core, in radii. */
export const ARMS = 8;
const ARM_REACH = 0.5;
/** The rim of marks: how many, how deep each is cut, in radii, and how fast it marches. */
const MARKS = 40;
const MARK_DEPTH = 0.025;
const MARCH = 0.6;
/** The points round the contour. */
const N = 96;
/** The core's radius, in mantle radii. */
export const CORE = 0.42;
/** The reaching arm's root and tip, in mantle radii, and its lobes. */
const REACH_ROOT = 0.34;
const REACH_TIP = 0.07;
const REACH_LOBES = 4;

/** Arm `k`'s angle round the mantle: the third points straight down at the hull. */
export const armAngle = (k: number): number => (k * Math.PI * 2) / ARMS;

/**
 * The contour's radius multiplier at angle `a`: the soft blob, an arm's lobe
 * where one points, and the rim of marks cut into it — flattened toward a
 * plain blob as the mimic is spent and loses its shape.
 */
function rimAt(p: MimicPose, a: number): number {
  const step = (Math.PI * 2) / ARMS;
  const k = Math.round(a / step) % ARMS;
  const off = (a - k * step) / (step / 2);
  // A round-ended petal, not a spike: full across most of the arm, falling away at its edges.
  const lobe = Math.max(0, 1 - off * off) ** 0.7;
  const out = p.arms[k] ?? 0;
  const firm = 1 - p.spent;
  const marks = Math.tanh(Math.sin(MARKS * a - p.wave * MARCH) * 2.2);
  return (
    blobRadiusMul(a, 1, 0.03, 0.02 + 0.12 * p.spent, p.wave, 13.2) *
    (1 + ARM_REACH * out * lobe * firm) *
    (1 + MARK_DEPTH * marks * firm)
  );
}

/** The mantle's contour, its eight arms and its rim of marks, rolled and squashed by the pose. */
export function mimicMantle(p: MimicPose): Path2D {
  const pts: Point[] = [];
  const wide = Math.max(0.08, Math.abs(p.turn));
  for (let i = 0; i < N; i++) {
    const a = (i / N) * Math.PI * 2;
    const m = rimAt(p, a) * p.r;
    pts.push({ x: p.x + Math.cos(a) * m * wide, y: p.y + Math.sin(a) * m * p.squash });
  }
  return splinePath(pts, true);
}

/** The bare core under the split: a round, a little squashed with the mantle. */
export function mimicCore(p: MimicPose): Path2D {
  const core = new Path2D();
  const r = CORE * p.r;
  core.ellipse(p.x, p.y, r, Math.max(1, r * p.squash), 0, 0, Math.PI * 2);
  return core;
}

/**
 * The arm reaching down toward the hull: a lobed tentacle from under the
 * mantle, `reach` long, swaying with the skin and thinning to its tip.
 */
export function mimicReachArm(l: Layout, p: MimicPose): Path2D | null {
  if (p.reach <= 1) return null;
  const top = { x: p.x, y: p.y + p.r * p.squash * 0.7 };
  const len = p.reach + p.r * p.squash * 0.3;
  const steps = 18;
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= steps; i++) {
    const u = i / steps;
    const sway = Math.sin(p.wave * 0.7 + u * 2.6) * 0.18 * l.tile * u;
    const lobe = 1 + 0.18 * Math.sin(u * Math.PI * 2 * REACH_LOBES);
    const half = p.r * (REACH_ROOT + (REACH_TIP - REACH_ROOT) * u) * lobe;
    const x = top.x + sway;
    const y = top.y + len * u;
    left.push({ x: x - half, y });
    right.push({ x: x + half, y });
  }
  return splinePath([...left, ...right.reverse()], true);
}

/**
 * The mottle on a face: soft dark-and-pale patches laid on the mantle, the
 * same on both screens, a different scatter for each face, drifting a little
 * as the skin ripples. Each is a centre and a radius, in pixels.
 */
export function mimicMottle(p: MimicPose): { x: number; y: number; r: number }[] {
  const out: { x: number; y: number; r: number }[] = [];
  const seed = p.face === 1 ? 1.3 : 4.1;
  const wide = Math.max(0.08, Math.abs(p.turn));
  for (let i = 0; i < 11; i++) {
    const a = i * 2.39996 + seed;
    const d = Math.sqrt((i + 0.5) / 11) * 0.82;
    const drift = 0.04 * Math.sin(p.wave * 0.5 + i);
    out.push({
      x: p.x + Math.cos(a) * (d + drift) * p.r * wide,
      y: p.y + Math.sin(a) * (d + drift) * p.r * p.squash,
      r: p.r * (0.13 + 0.07 * Math.abs(Math.sin(i * 1.7 + seed))),
    });
  }
  return out;
}
