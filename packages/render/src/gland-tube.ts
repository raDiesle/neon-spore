import { openSmoothPath, type Point } from "@neon-spore/content";

/**
 * A TUBE AND A CURVE — the two pieces of vector arithmetic every grown thing
 * on VERSUS is drawn out of.
 *
 * They lived in `candidates/panel-join/vessel/vein.ts` and were wanted next by
 * `candidates/ship-body/gullet/`, and a candidate importing from a candidate in
 * another slot is a trap: the day the first slot is decided its directory is
 * removed whole (`bun run versus adopt`), and the second slot's card stops
 * compiling in the hands of whoever ran the command. So they live here, beside
 * `variant.ts`, which stays whether or not any slot is open.
 */

/**
 * A tube of varying width around a centreline, as a closed path.
 *
 * Offsetting the line by the half-width along its own normal rather than
 * horizontally is what lets a branch leave a trunk at an angle and still have
 * an even thickness — a horizontal offset thins every diagonal by its own
 * cosine, which is exactly the defect that makes a hand-drawn vein read as a
 * ribbon.
 */
export function tube(mid: readonly Point[], half: (p: number) => number): string {
  const last = mid.length - 1;
  if (last < 1) return "";
  const left: Point[] = [];
  const right: Point[] = [];
  for (let i = 0; i <= last; i++) {
    const a = mid[Math.max(0, i - 1)] as Point;
    const b = mid[Math.min(last, i + 1)] as Point;
    const at = mid[i] as Point;
    const len = Math.max(1e-3, Math.hypot(b.x - a.x, b.y - a.y));
    const nx = -(b.y - a.y) / len;
    const ny = (b.x - a.x) / len;
    const w = half(i / last);
    left.push({ x: at.x + nx * w, y: at.y + ny * w });
    right.push({ x: at.x - nx * w, y: at.y - ny * w });
  }
  right.reverse();
  return `${openSmoothPath([...left, ...right])} Z`;
}

/** A cubic sampled into points — one vessel's centreline. */
export function curve(a: Point, b: Point, c1: Point, c2: Point, n: number): Point[] {
  const pts: Point[] = [];
  for (let i = 0; i <= n; i++) {
    const t = i / n;
    const u = 1 - t;
    pts.push({
      x: u ** 3 * a.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t ** 3 * b.x,
      y: u ** 3 * a.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t ** 3 * b.y,
    });
  }
  return pts;
}
