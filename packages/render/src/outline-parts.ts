import { DEG } from "./idle-drift.js";
import {
  PART_ROWS,
  type PartAngles,
  type PartRow,
  partDrift,
  partSeed,
  STILL,
} from "./idle-drift-parts.js";
import { OUTLINE_SEED, type OutlineBoss, outlinePose, type Point } from "./outline-drift.js";

/**
 * **The outline tier's parts** (`docs/spec/living-bosses.md` §1, "How an
 * outline boss gets it"): each named part of a boss drawn as an outline
 * turns, tilts and rotates about its own joint on top of the body's lean
 * (`outline-drift.ts`), by the part drift's numbers (`idle-drift-parts.ts`).
 *
 * A flat part shows the three angles the only way it can: **rotate** turns it
 * about the joint in the plane we see, **turn** squashes it across its length
 * by the cosine and shears its far end towards the side it turned to, and
 * **tilt** shortens it along its length — a pose, not a turn. One matrix a
 * part (`partMatrix`), which the canvas takes or a run of points goes
 * through; no path is kept.
 *
 * **Big enough to be seen** (`docs/looks.md`, the owner, 27 September 2026):
 * the table's ranges are the size he could not tell from a still boss, so a
 * part's own wander is scaled until its widest moves its tip `PART.tip` of a
 * tile, however long the part is. Only a part no hit test reads moves this
 * far: a boss with a mark on a part makes its hit test follow the part first
 * (`instarMarkUnder` is the worked example).
 *
 * `OUTLINE_PARTS` is whether each boss's parts move, apart from its body's
 * `OUTLINE_DRIFT`: 0 draws no part moved at all.
 */

/**
 * How much of the part drift each boss's parts take: 0 still, 1 scaled to
 * `PART.tip`. The queen's are held at 0: at half a tile her wings' ends are
 * behind her torches and her arms still read as nearly still on a phone, and
 * moving them further runs into her drop cue (`docs/queue.md`, "THE BULB
 * QUEEN's parts: how far"). THE WARDEN has none: the whole ring rocks
 * (`warden-drift.ts`); nor THE THROAT, whose rings swing (`throat-sway.ts`),
 * nor THE UNDERTOW, whose every lobe leans whole (`undertow-drift.ts`), nor
 * THE GORGE, whose lobes do the same (`gorge-drift.ts`), nor THE CURTAIN,
 * whose hem swings whole (`curtain-sway.ts`).
 */
export const OUTLINE_PARTS: Record<OutlineBoss, number> = {
  queen: 0,
  cairn: 1,
  reprise: 1,
  warden: 0,
  throat: 0,
  undertow: 0,
  gorge: 0,
  curtain: 0,
};

export const PART = {
  /** How far a part's own wander moves its tip at its widest, in tiles: more than twice the body's fifth, which the owner could not see. */
  tip: 0.5,
  /** Shorter than this, in tiles — 6 px on a 390 px field of seven columns — a part does not move. */
  minTiles: 0.1,
  /** How far a part's far end shears across for a radian of turn, as a share of its length. */
  slide: 0.25,
  /** At most this many moving parts a boss, a pair counting as two. */
  most: 8,
} as const;

/** Where a part turns about, which way it points from there, and how long it is. */
export interface PartFrame {
  readonly joint: Point;
  /** From the joint towards the tip, radians. */
  readonly axis: number;
}

/**
 * The body's lean as the parts hang on it: its roll, the only one of its
 * angles that turns a flat part. `STILL` where the body draws no pose.
 */
export function outlineBody(
  boss: OutlineBoss,
  hush: number,
  reach: number,
  tile: number,
): (t: number) => PartAngles {
  return (t) => {
    const p = outlinePose(boss, t, hush, reach, tile);
    return p === null ? STILL : { turn: 0, tilt: 0, rotate: p.roll };
  };
}

/** How far a radian of each of a row's angles moves a tip one tile out, at its widest. */
function ownReach(row: PartRow): number {
  const r = PART_ROWS[row];
  const turn = Math.max(r.turn[0], r.turn[1]);
  const tilt = r.tilt[0] + (r.tiltBias ?? 0);
  return DEG * (r.rotate[1] + PART.slide * turn) + (1 - Math.cos(DEG * tilt));
}

/**
 * Part `index` of `boss`, on the part-table row `row`, hung on `parent`, as a
 * function of time the next part down can hang on. Its own wander is scaled
 * so its tip, `length` tiles from its joint, moves `PART.tip` at the widest; a
 * part under `PART.minTiles` only follows. `hush` is the body's
 * (`outlineHush`), times anything of the drawer's own that stills the part.
 */
export function partOn(
  boss: OutlineBoss,
  index: number,
  row: PartRow,
  parent: (t: number) => PartAngles,
  length: number,
  hush: number,
): (t: number) => PartAngles {
  const k = OUTLINE_PARTS[boss] * hush;
  const gain = length < PART.minTiles ? 0 : PART.tip / (length * ownReach(row));
  const seed = partSeed(OUTLINE_SEED[boss], index);
  return (t) =>
    partDrift(t, seed, row, parent, k * gain, { life: OUTLINE_PARTS[boss] > 0 ? 1 : 0 });
}

/**
 * A part's angles as drawn inside its body's pose — its own less the body's —
 * or `null` when there is nothing to draw. `mirror` -1 draws the left of a
 * pair as the right's reflection: rotate and turn change sign, tilt does not.
 */
export function partRelative(
  part: PartAngles,
  body: PartAngles,
  mirror: -1 | 1 = 1,
): PartAngles | null {
  const turn = (part.turn - body.turn) * mirror;
  const tilt = part.tilt - body.tilt;
  const rotate = (part.rotate - body.rotate) * mirror;
  if (turn === 0 && tilt === 0 && rotate === 0) return null;
  return { turn, tilt, rotate };
}

type Matrix = readonly [number, number, number, number, number, number];

/** The part's angles as the canvas's six numbers, about its joint. */
export function partMatrix(a: PartAngles, f: PartFrame): Matrix {
  const cr = Math.cos(a.rotate + f.axis);
  const sr = Math.sin(a.rotate + f.axis);
  const ca = Math.cos(f.axis);
  const sa = Math.sin(f.axis);
  // Into the part's own axes (u along it, v across), squash and shear, then
  // back out turned by the axis and the rotate together.
  const uu = Math.cos(a.tilt);
  const uv = PART.slide * Math.sin(a.turn);
  const vv = Math.cos(a.turn);
  // S · R(-axis): columns are where screen x and screen y land in (u, v).
  const s0 = uu * ca;
  const s1 = uv * ca - vv * sa;
  const s2 = uu * sa;
  const s3 = uv * sa + vv * ca;
  const m0 = cr * s0 - sr * s1;
  const m1 = sr * s0 + cr * s1;
  const m2 = cr * s2 - sr * s3;
  const m3 = sr * s2 + cr * s3;
  const { x, y } = f.joint;
  return [m0, m1, m2, m3, x - (m0 * x + m2 * y), y - (m1 * x + m3 * y)];
}

/** Where the part's matrix puts `q`. */
export function partPoint(m: Matrix, q: Point): Point {
  return { x: m[0] * q.x + m[2] * q.y + m[4], y: m[1] * q.x + m[3] * q.y + m[5] };
}
