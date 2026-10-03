import type { GimbalState } from "@neon-spore/sim";
import type { Point } from "./gimbal-shape.js";
import { easeHush, HUSH, idleDrift } from "./idle-drift.js";
import { bodyLife } from "./motion-life.js";
import { type SlowSpan, slowHush } from "./slow-hush.js";

/**
 * **THE GIMBAL, drifting** (`docs/spec/living-bosses.md` §1, the rollout's
 * four rig candidates): the cradle drawn through its rig
 * (`gimbal-rig.ts`) and wandering on the idle drift — the whole cradle turning
 * a little in its yoke, tipping toward the players and back, and rolling;
 * the drum nodding inside its rings on its own, the way a head leads a body.
 *
 * **In the game since 3 October 2026.** Offered in VERSUS as `gimbal:tilt`
 * / `drift` and taken by the owner (`tools/versus/DECIDED.md`); the flat
 * picture it was judged against is gone, and a level cradle is a hush of 0.
 *
 * **What a thumb is measured against moves with what it is aligning.** The
 * rings are drawn through an affine of the plane they stand in
 * (`tiltMatrix`), and the ring, its teeth and this seat's mark all go through
 * it together, so a ring brought onto its drawn mark is on its true mark
 * however the cradle leans. All the drift can move is where the drawn rim
 * sits under the thumb, which is why a turn keeps a third of it (the HUSH
 * table's window over marks) rather than the tenth THE INSTAR's marks get —
 * a tenth would leave the drift on screen only for the two dark beats before
 * the first turn. THE SLOW over a shear takes it to a tenth of that.
 * `gimbal-tilt.test.ts` measures the widest it gets against the grab radius
 * and the true band.
 */

/** THE GIMBAL's own lattice, so it never wanders in step with another boss. */
const SEED = 163;

/** How much of the drift each phase keeps: dark and still it wanders, a turn steadies for the hands. */
export const KEEP = {
  still: HUSH.alive,
  turn: HUSH.marks,
  shear: HUSH.marks,
  open: HUSH.beaten,
} as const;

/** The angles the cradle is drawn at, in radians. `drum` is the drum's own nod on top of `pitch`. */
export interface GimbalTilt {
  readonly yaw: number;
  readonly pitch: number;
  readonly roll: number;
  readonly drum: number;
}

export const LEVEL: GimbalTilt = { yaw: 0, pitch: 0, roll: 0, drum: 0 };

/**
 * How much drift is left this frame: the phase's share, eased over a beat from
 * the phase before it — a turn follows the stillness the first time and a shear
 * after — and THE SLOW's on top (`slow-hush.ts`).
 */
export function gimbalHush(
  s: GimbalState,
  slow: SlowSpan,
  beat: number,
  beatPhase: number,
): number {
  const before =
    s.phase === "turn"
      ? s.cursor === 0
        ? KEEP.still
        : KEEP.shear
      : s.phase === "shear"
        ? KEEP.turn
        : s.phase === "open"
          ? KEEP.shear
          : KEEP.still;
  const since = beat + beatPhase - s.phaseBeat;
  return easeHush(before, KEEP[s.phase], since) * slowHush(slow, beat, beatPhase);
}

/** The cradle's angles at `time` seconds, `hush` of the way to the whole drift. */
export function gimbalTilt(time: number, hush: number): GimbalTilt {
  const k = hush * bodyLife();
  if (k === 0) return LEVEL;
  const d = idleDrift(time, SEED, k);
  return { yaw: d.yaw, pitch: d.pitch, roll: d.roll, drum: d.headYaw };
}

/**
 * The plane the rings stand in, seen at `tilt`, as a canvas transform about
 * the cradle's middle — `[a, b, c, d]` for `ctx.transform(a, b, c, d, e, f)`.
 * It is `see` (`content/solid.ts`) at `view(FRONT + yaw, pitch)` restricted to
 * that plane, which an orthographic view keeps affine: a flat thing drawn on a
 * ring through it lands where the rig puts the ring. Roll is laid on outside it.
 */
export function tiltMatrix(t: GimbalTilt): [number, number, number, number] {
  return [Math.cos(t.yaw), -Math.sin(t.yaw) * Math.sin(t.pitch), 0, Math.cos(t.pitch)];
}

/** Where a point drawn flat at (`x`, `y`) about the cradle's middle lands once tilted and rolled. */
export function tilted(x: number, y: number, t: GimbalTilt): Point {
  const [a, b, , d] = tiltMatrix(t);
  const tx = a * x;
  const ty = b * x + d * y;
  const c = Math.cos(t.roll);
  const s = Math.sin(t.roll);
  return { x: tx * c - ty * s, y: tx * s + ty * c };
}

/** Lays the plane's tilt on `ctx` about `at`; the roll is the caller's, laid on before the rig. */
export function tiltPlane(ctx: CanvasRenderingContext2D, at: Point, t: GimbalTilt): void {
  const [a, b, c, d] = tiltMatrix(t);
  ctx.translate(at.x, at.y);
  ctx.transform(a, b, c, d, 0, 0);
  ctx.translate(-at.x, -at.y);
}
