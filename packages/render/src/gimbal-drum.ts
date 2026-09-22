import type { GimbalState, SimConfig } from "@neon-spore/sim";
import { BEARING_TURN } from "@neon-spore/sim";
import { smoothstep } from "./ease.js";
import type { Point } from "./gimbal-shape.js";

/**
 * **The sealed drum the two rings hang round, and the clock the whole scene is
 * posed off** (§18, *Animation*).
 *
 * Cut off `gimbal-shape.ts` the moment that file was written, at 279 lines,
 * along the seam it already had in it: next door is *where a ring is*, which
 * the thumb will be answered against, and here is *what the drum is doing* and
 * *how far through a pose we are*, which nothing is ever answered against. A
 * ring is geometry the hand shares; the drum is only ever looked at.
 *
 * **The perspective change lives here** (`.claude/skills/new-boss` §5's third
 * standard). While the drum is sealed it is face-on, a circle; as the hatch
 * swings it tips toward the ship and every ellipse on it flattens, so the pair
 * sees the inside of a thing they have been looking at the outside of for a
 * minute. That is one number — `gimbalDrumFlat` — and everything drawn on the
 * drum reads it, which is why a leaf and the core cannot tip apart.
 */

/** How face-on the drum is: 1 sealed, and flattening toward 0.5 as it tips over to show its inside. */
export function gimbalDrumFlat(open: number): number {
  return 1 - 0.5 * smoothstep(open);
}

/**
 * One leaf of the hatch — the top half of the drum, or the bottom — swung
 * `open` off the seam. Its straight edge bows as it goes, because the face the
 * pair is shown turns from the outside of the drum to the inside of it, and a
 * leaf that stayed a flat half-circle would read as a lid sliding rather than
 * a door swinging.
 */
export function gimbalLeafPath(at: Point, r: number, side: -1 | 1, open: number): Path2D {
  const lift = side * open * r * 0.7;
  const ry = r * gimbalDrumFlat(open);
  const from = side < 0 ? Math.PI : 0;
  const p = new Path2D();
  p.ellipse(at.x, at.y + lift, r, ry, 0, from, from + Math.PI);
  p.quadraticCurveTo(
    at.x,
    at.y + lift - side * r * 0.34 * open,
    at.x + r * Math.cos(from),
    at.y + lift,
  );
  p.closePath();
  return p;
}

/** What the open hatch shows: the core, wider the further the leaves have swung. */
export function gimbalCorePath(at: Point, r: number, open: number): Path2D {
  const p = new Path2D();
  const ry = Math.max(0.01, r * 0.82 * smoothstep(open));
  p.ellipse(at.x, at.y, r * 0.94, ry, 0, 0, Math.PI * 2);
  return p;
}

/**
 * The ribs of one leaf: short staves standing off the plating between the
 * seam and the rim, lifting with the leaf they are on.
 *
 * Without them the drum was a filled circle with a stroke round it, which is
 * the one thing the queue's entry for this boss said not to draw. A drum is
 * made of staves, and three to a leaf is enough for the eye to say so at the
 * size this is drawn at.
 */
export function gimbalRibPath(at: Point, r: number, side: -1 | 1, open: number): Path2D {
  const p = new Path2D();
  const lift = side * open * r * 0.7;
  const flat = gimbalDrumFlat(open);
  for (const share of [0.25, 0.5, 0.75]) {
    const turn = Math.PI * share + (side < 0 ? Math.PI : 0);
    const cos = Math.cos(turn);
    const sin = Math.sin(turn) * flat;
    p.moveTo(at.x + r * 0.34 * cos, at.y + lift + r * 0.34 * sin);
    p.lineTo(at.x + r * 0.88 * cos, at.y + lift + r * 0.88 * sin);
  }
  return p;
}

/** The hoop round the drum's waist, inside the staves — hidden as the leaves part. */
export function gimbalHoopPath(at: Point, r: number, open: number): Path2D {
  const p = new Path2D();
  const rr = r * 0.34;
  p.ellipse(at.x, at.y, rr, rr * gimbalDrumFlat(open), 0, 0, Math.PI * 2);
  return p;
}

/** The shut hatch's own seam across the drum's middle — the line the leak comes out of. */
export function gimbalSeamPath(at: Point, r: number, open: number): Path2D {
  const p = new Path2D();
  const w = r * (1 - 0.15 * open);
  p.moveTo(at.x - w, at.y);
  p.quadraticCurveTo(at.x, at.y + r * 0.12, at.x + w, at.y);
  return p;
}

/** How far through a phase the scene is, 0..1, on the beat the phase began. */
function through(s: GimbalState, beats: number, beat: number, beatPhase: number): number {
  const done = (beat - s.phaseBeat + beatPhase) / Math.max(1, beats);
  return Math.min(1, Math.max(0, done));
}

/** How far up out of the dark the picture has come, 0..1 — 1 everywhere but the opening still. */
export function gimbalStillPhase(
  s: GimbalState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "still" ? through(s, cfg.gimbalStillBeats, beat, beatPhase) : 1;
}

/** How far through a shear, 0..1; 0 outside one, so the spark is drawn by multiplication. */
export function gimbalShearPhase(
  s: GimbalState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "shear" ? through(s, cfg.gimbalShearBeats, beat, beatPhase) : 0;
}

/** How far through the hatch, 0..1; 0 while the drum is still sealed. */
export function gimbalOpenPhase(
  s: GimbalState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  return s.phase === "open" ? through(s, cfg.gimbalOpenBeats, beat, beatPhase) : 0;
}

/** How far the leaking spark is along its fuse, 0..1 — the one thing on this boss with a clock of its own. */
export function gimbalSeamPhase(
  s: GimbalState,
  cfg: SimConfig,
  beat: number,
  beatPhase: number,
): number {
  const done = (beat - s.seamBeat + beatPhase) / Math.max(1, cfg.gimbalSeamBeats);
  return Math.min(1, Math.max(0, done));
}

/**
 * How far a ring with nothing left to grip has spun, in thousandths. Off wall
 * time rather than the beat, because this is the one moment on this boss where
 * the rings are not answering anybody — the last tooth is gone, both spin
 * loose, and a ring still stepping in time would read as one more alignment
 * coming.
 */
export function gimbalSpinMilli(open: number, time: number): number {
  return time * 0.26 * smoothstep(open) * BEARING_TURN;
}
