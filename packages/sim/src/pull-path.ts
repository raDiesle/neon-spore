import { isqrt } from "./handle-pull.js";
import { type PullHeard, pullHeard } from "./pull.js";

/**
 * **A pull whose path bends** — the owner, 11 October 2026: *curves (custom
 * paths) increase difficulty and are more exciting than straight lines*, and
 * on 13 October, which pulls: THE WARDEN's and THE LID's cords, THE SINEW and
 * THE LATCH. The PULL LAB's rule (`tools/director/src/pull-lab-rule.ts`,
 * `pull-lab-stray.ts`) is its specification; this is the same rule in
 * thousandths of a tile, on the tick, where both phones keep it.
 *
 * - **The path is a polyline** from the knob's rest, every point in
 *   thousandths of a tile relative to it, down and right positive — the same
 *   axes as a drag's `fromMilli` and `fromYMilli`, so a caller hands the
 *   command's displacement straight in.
 * - **Progress is the distance along it** to the point nearest the thumb,
 *   looked for first within `PULL_PATH_WINDOW` of where the knob already is,
 *   so a curve that doubles back is not jumped across — the lab's ±0.3 — and
 *   on the whole path only when the thumb is off the window's part of it.
 * - **A thumb further off the path than `PULL_STRAY_MILLI` fails the pull**:
 *   `strayed`, the knob home, and the caller says it with `pullStray`. A pull
 *   that has already counted cannot stray; the hand is only coming home.
 * - **Everything else is the straight pull's** (`pull.ts`): progress is a
 *   `down` travel of the path's whole length, so a count, a short lift and a
 *   tap read exactly as they do on a straight cord.
 *
 * Integer throughout: a segment's length is `isqrt`, never `Math.sqrt`, and a
 * projection is a truncated division (`purity.test.ts`).
 */

/** A point of a path, in thousandths of a tile from the knob's rest. */
export interface PullPoint {
  x: number;
  y: number;
}

/** A path: `pts[0]` is the rest, `{ x: 0, y: 0 }`, and the last point is where it counts. */
export interface PullPath {
  pts: readonly PullPoint[];
}

/** What a hand on a path came to: a straight pull's, or off the path. */
export type PullPathHeard = PullHeard | "strayed";

/**
 * How far either side of the path a thumb may wander, thousandths of a tile:
 * the lab's half a tile (`STRAY_TILES.half`), doubled for a fingertip, which
 * covers the path it follows (`TOUCH_SLACK`) — the game is played on glass.
 */
export const PULL_STRAY_MILLI = 1000;

/** How far either side of the knob the nearest point is looked for, thousandths of the path's length. */
export const PULL_PATH_WINDOW = 300;

/** A half-sine in eighths, thousandths: a bow's share of its width at each eighth of its length. */
const BOW = [0, 383, 707, 924, 1000, 924, 707, 383, 0] as const;

/**
 * A bowed path: `lengthMilli` along `way`, bulging `bowMilli` toward `side`
 * halfway — a half-wave out and back, the shape every bent pull in the game
 * takes (`warden-bow.ts`, `lid-bow.ts`). Both are unit steps in whole
 * numbers, x across and y down. A table of the half-sine rather than
 * `Math.sin`, which two engines need not round alike.
 */
export function pullBowPath(
  way: { dx: number; dy: number },
  side: { dx: number; dy: number },
  lengthMilli: number,
  bowMilli: number,
): PullPath {
  const n = BOW.length - 1;
  return {
    pts: BOW.map((s, k) => {
      const along = Math.trunc((lengthMilli * k) / n);
      const out = Math.trunc((s * bowMilli) / 1000);
      return { x: way.dx * along + side.dx * out, y: way.dy * along + side.dy * out };
    }),
  };
}

/**
 * The point of `pullBowPath(way, side, lengthMilli, bowMilli)` that stands
 * `at` thousandths along `way` — the bow read by its straight distance
 * rather than its length, for a pull whose tension is how far along its way
 * the hand has come (`lid-bow.ts`).
 */
export function pullBowAt(
  way: { dx: number; dy: number },
  side: { dx: number; dy: number },
  lengthMilli: number,
  bowMilli: number,
  at: number,
): PullPoint {
  const n = BOW.length - 1;
  const a = Math.max(0, Math.min(lengthMilli, at));
  const k = lengthMilli <= 0 ? 0 : Math.min(n - 1, Math.trunc((a * n) / lengthMilli));
  const k0 = Math.trunc((lengthMilli * k) / n);
  const k1 = Math.trunc((lengthMilli * (k + 1)) / n);
  const s0 = BOW[k] ?? 0;
  const s1 = BOW[k + 1] ?? 0;
  const s = k1 === k0 ? s0 : s0 + Math.trunc(((s1 - s0) * (a - k0)) / (k1 - k0));
  const out = Math.trunc((s * bowMilli) / 1000);
  return { x: way.dx * a + side.dx * out, y: way.dy * a + side.dy * out };
}

/** The length of segment `i` (from `pts[i]` to `pts[i + 1]`), thousandths of a tile. */
function segLength(path: PullPath, i: number): number {
  const a = path.pts[i];
  const b = path.pts[i + 1];
  if (a === undefined || b === undefined) return 0;
  return isqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}

/** The whole length of the path, thousandths of a tile: the reach a pull along it has to go. */
export function pullPathLength(path: PullPath): number {
  let n = 0;
  for (let i = 0; i + 1 < path.pts.length; i++) n += segLength(path, i);
  return n;
}

/** The point `along` thousandths of a tile down the path, cut to its two ends. */
export function pullPathPoint(path: PullPath, along: number): PullPoint {
  let cum = 0;
  for (let i = 0; i + 1 < path.pts.length; i++) {
    const len = segLength(path, i);
    const a = path.pts[i];
    const b = path.pts[i + 1];
    if (a === undefined || b === undefined) break;
    if (along <= cum + len || i + 2 === path.pts.length) {
      const t = Math.max(0, Math.min(len, along - cum));
      if (len === 0) return { x: a.x, y: a.y };
      return {
        x: a.x + Math.trunc(((b.x - a.x) * t) / len),
        y: a.y + Math.trunc(((b.y - a.y) * t) / len),
      };
    }
    cum += len;
  }
  return path.pts[0] ?? { x: 0, y: 0 };
}

/**
 * The point of the path nearest `(x, y)` within the window round `from`, as
 * its distance along, and the square of how far off it the thumb is — or,
 * where nothing in the window is within the stray, the nearest on the whole
 * path: a hand that jumped further than the window in one command (a film, a
 * slow frame) and is on the path is on it, and a hairpin is still not jumped
 * across while the thumb is on the leg it was on.
 */
export function pullPathNearest(
  path: PullPath,
  from: number,
  x: number,
  y: number,
): { alongMilli: number; offSq: number } {
  const total = pullPathLength(path);
  const w = Math.trunc((total * PULL_PATH_WINDOW) / 1000);
  const near = nearestIn(path, Math.max(0, from - w), Math.min(total, from + w), x, y, from);
  if (near.offSq <= PULL_STRAY_MILLI * PULL_STRAY_MILLI) return near;
  const all = nearestIn(path, 0, total, x, y, from);
  return all.offSq < near.offSq ? all : near;
}

/** The nearest point between `lo` and `hi` along the path; `from`, held to them, with none. */
function nearestIn(
  path: PullPath,
  lo: number,
  hi: number,
  x: number,
  y: number,
  from: number,
): { alongMilli: number; offSq: number } {
  let best = { alongMilli: Math.max(lo, Math.min(hi, from)), offSq: Number.MAX_SAFE_INTEGER };
  let cum = 0;
  for (let i = 0; i + 1 < path.pts.length; i++) {
    const len = segLength(path, i);
    const a = path.pts[i];
    const b = path.pts[i + 1];
    if (a === undefined || b === undefined) break;
    const s0 = Math.max(lo, cum);
    const s1 = Math.min(hi, cum + len);
    if (s0 <= s1) {
      // The foot of the perpendicular, in thousandths along this segment, held to the window.
      const dot = len === 0 ? 0 : (x - a.x) * (b.x - a.x) + (y - a.y) * (b.y - a.y);
      const foot = len === 0 ? 0 : Math.trunc(dot / len);
      const along = Math.max(s0, Math.min(s1, cum + foot));
      const p = pullPathPoint(path, along);
      const offSq = (x - p.x) ** 2 + (y - p.y) ** 2;
      if (offSq < best.offSq) best = { alongMilli: along, offSq };
    }
    cum += len;
  }
  return best;
}

/**
 * One drag command read against a path: `x` and `y` the hand's displacement
 * from where it took hold, `from` how far along the knob already is, and
 * `counted` whether this hold has already counted. What comes back is the
 * progress to keep and what the hand came to — `strayed` off the path, the
 * progress gone, and a straight pull's verdict otherwise.
 */
export function pullPathHeard(
  path: PullPath,
  counted: boolean,
  on: boolean,
  x: number,
  y: number,
  from: number,
): { travelMilli: number; heard: PullPathHeard } {
  const near = pullPathNearest(path, from, x, y);
  if (!counted && near.offSq > PULL_STRAY_MILLI * PULL_STRAY_MILLI) {
    return { travelMilli: 0, heard: "strayed" };
  }
  return pullHeard({ way: "down", reachMilli: pullPathLength(path) }, counted, on, near.alongMilli);
}
