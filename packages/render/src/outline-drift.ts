import type { World } from "@neon-spore/sim";
import { DEG, HUSH, IDLE_DRIFT, idleDrift } from "./idle-drift.js";
import { slowHush } from "./slow-hush.js";

/**
 * **The outline tier** (`docs/spec/living-bosses.md` §1, "How far it reaches,
 * by kind of body"): a boss still drawn as an outline takes the idle drift's
 * numbers as a pose, not as a view. The roll is a lean about the body's root,
 * the turn a squash across it and a small shift towards it, and the pitch a
 * stretch up it. It reads as alive, not as turning; the real turn is the rig's.
 *
 * **Capped by reach, not by angle.** A mark on the body is a target — a ring
 * a thumb presses, a mark over a column a cannon fires up — and its hit test
 * reads the rest pose. So the pose is measured in how far it moves the body's
 * farthest point, `reach` pixels from the root: never more than
 * `OUTLINE.shift` of a tile, well inside the widest hit circle a mark takes
 * (`hitCircle`, 1.5 of a 0.3-tile handle). A wide body leans less than a
 * narrow one by exactly that rule, and the hit tests need no transform.
 *
 * The pose is one matrix (`poseMatrix`), which the canvas takes and which
 * `posePoint` applies to a point — the test's way of measuring what the
 * canvas will draw. `OUTLINE_DRIFT` is how much of it each boss takes; the
 * shipped 0 draws no transform at all, and it is the seam a VERSUS candidate
 * patches (`tools/versus/candidates/*-drift/`).
 */

export type OutlineBoss = "queen" | "cairn" | "reprise";

/** How much of its pose each boss takes: 0 dead still, 1 the whole. Never past 1 — the cap is at 1. */
export const OUTLINE_DRIFT: Record<OutlineBoss, number> = { queen: 0, cairn: 0, reprise: 0 };

/** Each boss's seed, so no two on one screen lean in step; its parts hash theirs from it (`outline-parts.ts`). */
export const OUTLINE_SEED: Readonly<Record<OutlineBoss, number>> = {
  queen: 101,
  cairn: 113,
  reprise: 127,
};

export const OUTLINE = {
  /** The most any point within reach moves from its rest, in tiles. */
  shift: 0.2,
  /** Each channel's share of that, at the body's reach: they add to under one. */
  share: { roll: 0.6, squash: 0.15, stretch: 0.1, slide: 0.15 },
} as const;

/** The body drift's widest angles, in degrees: the roll's, the pitch's and the turn's. */
const ROLL_MAX = IDLE_DRIFT.roll.amp;
const PITCH_MAX = IDLE_DRIFT.pitch.amp;
const YAW_MAX = IDLE_DRIFT.headYaw.amp * IDLE_DRIFT.follow + IDLE_DRIFT.yaw.amp;

export interface OutlinePose {
  /** The lean, radians, about the root. */
  readonly roll: number;
  /** Across and up, about the root: 1 at rest. */
  readonly sx: number;
  readonly sy: number;
  /** The slide towards the turn, pixels. */
  readonly dx: number;
}

export interface Point {
  readonly x: number;
  readonly y: number;
}

/**
 * `boss`'s pose at `time` seconds for a body whose farthest point is `reach`
 * pixels from its root, or `null` where it draws none — its seam at 0, or
 * hushed to nothing.
 */
export function outlinePose(
  boss: OutlineBoss,
  time: number,
  hush: number,
  reach: number,
  tile: number,
): OutlinePose | null {
  const k = OUTLINE_DRIFT[boss] * hush;
  if (k <= 0 || reach <= 0) return null;
  const d = idleDrift(time, OUTLINE_SEED[boss], k);
  // Each channel's share of the cap, as a fraction of the reach.
  const at = (share: number) => (share * OUTLINE.shift * tile) / reach;
  const { roll, squash, stretch, slide } = OUTLINE.share;
  const yaw = Math.max(-1, Math.min(1, d.yaw / (YAW_MAX * DEG)));
  return {
    roll: (d.roll / (ROLL_MAX * DEG)) * at(roll),
    sx: 1 - yaw * yaw * at(squash),
    sy: 1 + (d.pitch / (PITCH_MAX * DEG)) * at(stretch),
    dx: yaw * slide * OUTLINE.shift * tile,
  };
}

/** The pose as the canvas's six numbers, about `root`: `[a, b, c, d, e, f]`. */
export function poseMatrix(
  p: OutlinePose,
  root: Point,
): readonly [number, number, number, number, number, number] {
  const cos = Math.cos(p.roll);
  const sin = Math.sin(p.roll);
  const a = cos * p.sx;
  const b = sin * p.sx;
  const c = -sin * p.sy;
  const d = cos * p.sy;
  return [
    a,
    b,
    c,
    d,
    root.x + p.dx - (a * root.x + c * root.y),
    root.y - (b * root.x + d * root.y),
  ];
}

/** Where the pose draws `q`. */
export function posePoint(p: OutlinePose, root: Point, q: Point): Point {
  const [a, b, c, d, e, f] = poseMatrix(p, root);
  return { x: a * q.x + c * q.y + e, y: b * q.x + d * q.y + f };
}

/** Draws `draw` in the pose about `root`; with no pose, draws it as it stands and adds nothing. */
export function withOutlinePose(
  ctx: CanvasRenderingContext2D,
  p: OutlinePose | null,
  root: Point,
  draw: () => void,
): void {
  if (p === null) {
    draw();
    return;
  }
  ctx.save();
  ctx.transform(...poseMatrix(p, root));
  draw();
  ctx.restore();
}

/**
 * The body's hush: 1 with no window, and a tenth while THE SLOW is open,
 * since every mark such a body asks for is on the body. A boss that never
 * opens THE SLOW is never hushed by it, and its marks are asked for over a
 * column or a ring whose hit test is wider than the cap.
 */
export function outlineHush(world: World, beat: number, beatPhase: number): number {
  return slowHush(world, beat, beatPhase, HUSH.liveMark);
}
